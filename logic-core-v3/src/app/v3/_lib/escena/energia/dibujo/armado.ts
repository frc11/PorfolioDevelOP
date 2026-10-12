import * as THREE from 'three'

import { FLOOR_Y } from '../../probeScene'
import { ARCOS, crearArcos, type EstadoDeLosArcos } from '../arcos/arcos'
import { crearCinta, type Cinta } from '../arcos/cinta'
import type { EntornoDeLosArcos } from '../arcos/programador'
import { azarConSemilla, crearBrasas, crearEntradaDeLasBrasas, type Brasas, type EntradaDeLasBrasas, type RayoDelPuntero } from '../brasas'
import { crearLectura, crearTemperatura, type Lectura, type Temperatura } from '../calor'
import { DIRECCIONES } from '../direcciones'
import { crearDominio, type Dominio } from '../dominio'
import { crearPuntero, type EstadoDelPuntero } from '../interaccion/interaccion'
import { largo3 } from '../largo'
import { FRAGMENTOS_DEL_HALO_DEL_ARCO, FRAGMENTOS_DE_LOS_ARCOS, VERTICES_DEL_HALO_DEL_ARCO, VERTICES_DE_LOS_ARCOS, uniformesDelTrazo } from './arcos'
import { DIBUJO, materialDeEnergia, uniformesComunes, type UniformesComunes } from './comun'
import { EFECTOS, FRAGMENTOS_DE_LOS_EFECTOS, VERTICES_DE_LOS_EFECTOS } from './efectos'
import { sombreadoresDeParticulas, uniformesDelAspecto, type NombreDelAspecto } from './particulas'
import { FRAGMENTOS_DE_LOS_REFLEJOS, REFLEJO, VERTICES_DE_LOS_REFLEJOS } from './reflejos'

/**
 * [PULIDO 17] O3 · EL ARMADO DE LA ENERGÍA (`docs/rediseno/PLASMA.md`): las brasas (CPU), las mallas (las brasas instanciadas, la cinta
 * de los arcos en dos pasadas, los efectos), las uniformes que comparten y lo que el programador de los arcos pregunta afuera: qué se
 * ve (adentro del cuadro y no sobre un texto) y el borde del logo (esos cierres se arman una vez, no por cuadro). [PULIDO 19] Q0 · el
 * enjambre de B (GPU) se borró con B.
 */

/** Lo que el cuadro sabe de la vista (lo escribe en cada cuadro). */
export interface Vista {
  camara: THREE.Camera | null
  ancho: number
  alto: number
}

export interface Armado {
  readonly azar: () => number
  readonly brasas: Brasas
  readonly entrada: EntradaDeLasBrasas
  readonly temperatura: Temperatura
  readonly lectura: Lectura
  readonly arcos: EstadoDeLosArcos
  readonly puntero: EstadoDelPuntero
  readonly cinta: Cinta
  /** [PULIDO 19] Q1.b · el dominio de la vista (`dominio.ts`) y si las brasas ya se sembraron en él (el primer cuadro con cámara). */
  readonly dominio: Dominio
  poblado: boolean
  readonly uniformes: UniformesComunes
  readonly atributosDeLasBrasas: readonly THREE.InstancedBufferAttribute[]
  readonly atributosDeLaCinta: readonly THREE.BufferAttribute[]
  readonly geometriaDeLaCinta: THREE.BufferGeometry
  readonly efectos: { readonly lugar: THREE.InstancedBufferAttribute; readonly efecto: THREE.InstancedBufferAttribute; readonly geometria: THREE.InstancedBufferGeometry }
  readonly mallas: readonly (THREE.Mesh | THREE.Points)[]
  /** El centro del logo en el mundo (todo lo demás también va en el mundo), un vector de trabajo, las luces de los arcos y el punto del puntero. */
  readonly centro: THREE.Vector3
  readonly v: THREE.Vector3
  readonly luces: Float32Array
  readonly puntoDelPuntero: Float32Array
  /** [PULIDO 18] P1.e · la cámara y el punto del puntero del cuadro anterior (el viento y la estela). */
  readonly camaraAntes: THREE.Vector3
  readonly puntoAntes: Float32Array
  readonly rayo: { activo: boolean; readonly r: { ox: number; oy: number; oz: number; dx: number; dy: number; dz: number } }
  readonly entorno: EntornoDeLosArcos
  readonly texto: { leidoEn: number; scroll: number }
  /** El halo de la carga del puntero (sigue a la carga y al soltar se funde) y las ondas de los pulsos (dónde, desde cuándo: ms). */
  halo: number
  readonly ondas: Float32Array
  /** Las uniformes que el banco ajusta en vivo, por grupo (`banco.ts`, `ajustar`). */
  readonly ajustables: Readonly<Record<'brasas' | 'arcos' | 'comun' | 'reflejo', Readonly<Record<string, THREE.IUniform>>>>
}

const CUADRADO = new Float32Array([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0])
/** Desde dónde se dibuja la energía (el orden de los transparentes; ver `mallas`). */
export const ORDEN_DE_LA_ENERGIA = -10

/** Pisa el aspecto de un estilo con lo que cambia la dirección. */
function conLoDeLaDireccion<T extends Record<string, THREE.IUniform>>(u: T, cambios: Partial<Record<NombreDelAspecto, readonly [number, number, number, number]>> | undefined): T {
  if (cambios === undefined) return u
  for (const [k, v] of Object.entries(cambios)) {
    const x = u[k]
    if (x !== undefined && x.value instanceof THREE.Vector4 && v !== undefined) x.value.set(v[0], v[1], v[2], v[3])
  }
  return u
}

function cuadrados(cuantos: number): THREE.InstancedBufferGeometry {
  const g = new THREE.InstancedBufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(CUADRADO, 3))
  g.setIndex([0, 1, 2, 2, 1, 3])
  g.instanceCount = cuantos
  return g
}

/** Arma todo (el plasma A, el producto). */
export function armar(compacto: boolean, vista: { readonly current: Vista }, logo: () => THREE.Object3D | null): Armado {
  const d = DIRECCIONES.a
  const azar = azarConSemilla(17)
  const brasas = crearBrasas(compacto ? d.brasas[1] : d.brasas[0], azar, FLOOR_Y)
  const uniformes = uniformesComunes()
  const mallas: (THREE.Mesh | THREE.Points)[] = []
  const gb = cuadrados(brasas.n)
  const atributosDeLasBrasas = [new THREE.InstancedBufferAttribute(brasas.lugar, 3), new THREE.InstancedBufferAttribute(brasas.velocidad, 3), new THREE.InstancedBufferAttribute(brasas.energia, 1), new THREE.InstancedBufferAttribute(brasas.brillo, 1)].map((x) => x.setUsage(THREE.DynamicDrawUsage))
  gb.setAttribute('aLugar', atributosDeLasBrasas[0])
  gb.setAttribute('aVelocidad', atributosDeLasBrasas[1])
  gb.setAttribute('aEnergia', atributosDeLasBrasas[2])
  gb.setAttribute('aBrillo', atributosDeLasBrasas[3])
  const sb = sombreadoresDeParticulas()
  const deLasBrasas = { ...conLoDeLaDireccion(uniformesDelAspecto('chispa'), d.aspecto?.brasas), uIntensidad: { value: d.intensidadDeLasBrasas } }
  const mallaDeBrasas = new THREE.Mesh(gb, materialDeEnergia(sb.vertexShader, sb.fragmentShader, { ...uniformes, ...deLasBrasas }))
  mallaDeBrasas.name = 'brasas'
  // [PULIDO 18] P1.a · el reflejo tenue en el piso: las mismas brasas, espejadas (sin la prueba de profundidad: está debajo del piso;
  // lo que tapa lo decide la profundidad del pase). Antes que las brasas.
  const delReflejo = { uReflejo: { value: new THREE.Vector4(...REFLEJO.uReflejo) }, uPiso: { value: REFLEJO.piso } }
  const materialDelReflejo = materialDeEnergia(VERTICES_DE_LOS_REFLEJOS, FRAGMENTOS_DE_LOS_REFLEJOS, { ...uniformes, ...deLasBrasas, ...delReflejo })
  materialDelReflejo.depthTest = false
  const mallaDeReflejos = new THREE.Mesh(gb, materialDelReflejo)
  mallaDeReflejos.name = 'reflejos en el piso'
  mallas.push(mallaDeReflejos, mallaDeBrasas)
  // La cinta de los arcos: la misma geometría en dos pasadas (lo oscuro y el halo; después los núcleos). Se dibuja siempre (los
  // lugares sin arco tienen ancho 0): el programa se arma al cargar, no con el primer arco.
  const cinta = crearCinta()
  const gt = new THREE.BufferGeometry()
  gt.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cinta.punto.length), 3))
  const atributosDeLaCinta = [new THREE.BufferAttribute(cinta.punto, 3), new THREE.BufferAttribute(cinta.antes, 3), new THREE.BufferAttribute(cinta.despues, 3), new THREE.BufferAttribute(cinta.forma, 4), new THREE.BufferAttribute(cinta.extra, 4)].map((x) => x.setUsage(THREE.DynamicDrawUsage))
  gt.setAttribute('aPunto', atributosDeLaCinta[0])
  gt.setAttribute('aAntes', atributosDeLaCinta[1])
  gt.setAttribute('aDespues', atributosDeLaCinta[2])
  gt.setAttribute('aForma', atributosDeLaCinta[3])
  gt.setAttribute('aExtra', atributosDeLaCinta[4])
  gt.setIndex(new THREE.BufferAttribute(cinta.indices, 1))
  const trazo = uniformesDelTrazo()
  // [PULIDO 18] P1.d · la pasada 0 (el halo y lo oscuro), con puntos a lo largo del camino (los mismos atributos, sin los índices: como
  // cinta se plegaba en los quiebres); la pasada 1 (el núcleo), la cinta fina.
  const gh = new THREE.BufferGeometry()
  for (const nombre of ['position', 'aPunto', 'aAntes', 'aDespues', 'aForma', 'aExtra']) gh.setAttribute(nombre, gt.getAttribute(nombre))
  const halo = new THREE.Points(gh, materialDeEnergia(VERTICES_DEL_HALO_DEL_ARCO, FRAGMENTOS_DEL_HALO_DEL_ARCO, { ...uniformes, ...trazo }))
  halo.name = 'arcos'
  const nucleos = new THREE.Mesh(gt, materialDeEnergia(VERTICES_DE_LOS_ARCOS, FRAGMENTOS_DE_LOS_ARCOS, { ...uniformes, ...trazo, uCapa: { value: 1 } }))
  nucleos.name = 'nucleos de los arcos'
  mallas.push(halo, nucleos)
  const ge = cuadrados(1)
  const lugarDeLosEfectos = new THREE.InstancedBufferAttribute(new Float32Array(EFECTOS.cuantos * 3), 3).setUsage(THREE.DynamicDrawUsage)
  const efecto = new THREE.InstancedBufferAttribute(new Float32Array(EFECTOS.cuantos * 4), 4).setUsage(THREE.DynamicDrawUsage)
  ge.setAttribute('aLugar', lugarDeLosEfectos)
  ge.setAttribute('aEfecto', efecto)
  const mallaDeEfectos = new THREE.Mesh(ge, materialDeEnergia(VERTICES_DE_LOS_EFECTOS, FRAGMENTOS_DE_LOS_EFECTOS, { ...uniformes }))
  mallaDeEfectos.name = 'efectos'
  mallas.unshift(mallaDeEfectos)
  // [PULIDO 18] P1.c · después de la trama y de la copia del cuadro (−18), antes del haz y del amanecer (1 a 3): el calor refracta lo de
  // atrás y lo que se dibuja después (el haz) queda encima. De noche suman: el orden no cambia nada.
  mallas.forEach((m, k) => {
    m.frustumCulled = false
    m.renderOrder = ORDEN_DE_LA_ENERGIA + k
  })
  const centro = new THREE.Vector3()
  const v = new THREE.Vector3()
  const rayo = { activo: false, r: { ox: 0, oy: 0, oz: 0, dx: 0, dy: 0, dz: 1 } }
  const seVe = (x: number, y: number, z: number): boolean => {
    const cam = vista.current.camara
    if (cam === null) return false
    v.set(x, y, z).project(cam)
    if (Math.abs(v.x) > 0.97 || Math.abs(v.y) > 0.97 || v.z <= -1 || v.z >= 1) return false
    for (let k = 0; k < uniformes.uCuantosTextos.value; k += 1) {
      const c = uniformes.uTextos.value[k]
      if (v.x > c.x && v.x < c.z && v.y > c.y && v.y < c.w) return false
    }
    return true
  }
  const mallasDelLogo: THREE.Mesh[] = []
  const bordeDelLogo = (x: number, y: number, z: number, destino: Float32Array): boolean => {
    if (mallasDelLogo.length === 0) logo()?.traverse((o) => { if (o instanceof THREE.Mesh) mallasDelLogo.push(o) })
    let mejor = Number.POSITIVE_INFINITY
    for (let k = 0; k < 64 && mallasDelLogo.length > 0; k += 1) {
      const malla = mallasDelLogo[Math.floor(azar() * mallasDelLogo.length)]
      const pos = malla.geometry.getAttribute('position')
      if (!(pos instanceof THREE.BufferAttribute) || pos.count === 0) continue
      v.fromBufferAttribute(pos, Math.floor(azar() * pos.count)).applyMatrix4(malla.matrixWorld)
      const dd = largo3(v.x - x, v.y - y, v.z - z)
      if (dd < mejor) {
        mejor = dd
        destino[0] = v.x
        destino[1] = v.y
        destino[2] = v.z
      }
    }
    return Number.isFinite(mejor)
  }
  const entorno: EntornoDeLosArcos = {
    camara: new Float32Array(3),
    logo: new Float32Array(3),
    get rayo(): RayoDelPuntero | null {
      return rayo.activo ? rayo.r : null
    },
    maximo: compacto ? ARCOS.maximoCompacto : ARCOS.maximo,
    temperatura: 0,
    actividadDelLogo: 0,
    seVe,
    bordeDelLogo,
  }
  return {
    azar, brasas, entrada: crearEntradaDeLasBrasas(), temperatura: crearTemperatura(), lectura: crearLectura(), arcos: crearArcos(azar), puntero: crearPuntero(), cinta, dominio: crearDominio(), poblado: false, uniformes,
    atributosDeLasBrasas, atributosDeLaCinta, geometriaDeLaCinta: gt, efectos: { lugar: lugarDeLosEfectos, efecto, geometria: ge }, mallas, centro, v, luces: new Float32Array(DIBUJO.luces * 4),
    puntoDelPuntero: new Float32Array(3), camaraAntes: new THREE.Vector3(Number.NaN, Number.NaN, Number.NaN), puntoAntes: new Float32Array(3).fill(Number.NaN), rayo, entorno, texto: { leidoEn: Number.NEGATIVE_INFINITY, scroll: Number.NaN }, halo: 0, ondas: new Float32Array(8).fill(Number.NEGATIVE_INFINITY),
    ajustables: { brasas: deLasBrasas, arcos: trazo, comun: uniformes, reflejo: delReflejo },
  }
}

/**
 * Sube lo del cuadro a la GPU: las brasas, la cinta (sólo si cambió: sin arcos, nada) y los efectos. Los búferes enteros, sin
 * rangos: con rangos three ordena con un comparador nuevo en cada subida (una reserva).
 */
export function subir(a: Armado, efectos: number): void {
  for (const x of a.atributosDeLasBrasas) x.needsUpdate = true
  if (a.cinta.cambio) for (const x of a.atributosDeLaCinta) x.needsUpdate = true
  // Siempre al menos uno (sin efectos, uno nulo: intensidad 0, no pinta): el programa se arma al cargar con el precompilado, no con el
  // primer arco (Direct3D arma el ejecutable de un programa en su primer dibujo: medido, un cuadro de 533 ms en calma).
  if (efectos === 0) (a.efectos.efecto.array as Float32Array)[2] = 0
  a.efectos.geometria.instanceCount = Math.max(1, efectos)
  if (efectos > 0 || a.efectos.geometria.instanceCount === 1) {
    a.efectos.lugar.needsUpdate = true
    a.efectos.efecto.needsUpdate = true
  }
}

export function soltar(a: Armado): void {
  const vistos = new Set<THREE.BufferGeometry | THREE.Material>()
  for (const m of a.mallas) {
    vistos.add(m.geometry)
    if (m.material instanceof THREE.Material) vistos.add(m.material)
  }
  for (const x of vistos) x.dispose()
}
