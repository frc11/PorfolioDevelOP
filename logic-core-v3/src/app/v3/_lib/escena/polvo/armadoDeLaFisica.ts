import * as THREE from 'three'

import { crearCronometro } from '../gpu/cronometro'
import { crearPingPong } from '../gpu/pingPong'
import { PISO_EN_VIVO } from '../piso/enVivo'
import { CAMPO_EN_VIVO, type campoDeAPoco, type MallaDelLogo } from './campoDelLogo'
import { AIRE } from './parche'
import { FISICA, SIMULACION_DEL_POLVO_GLSL } from './simulacion'
import { conchasDelPolvoParejo, posicionesDelPolvoParejo } from './volumen'

/**
 * [CIERRE RETOQUE 3D] Deuda · LO QUE `Fisica.tsx` ARMA Y CORRE, sin React — la simulación (el ping-pong, sus uniforms y el
 * cronómetro), el paso que el cuadro rellena, el horno del campo del logo de a poco y las mallas del logo. Salió de
 * `Fisica.tsx` al pasar las 300 líneas (`s8-montaje`): el corte es por tema, el componente se quedó con el cuadro.
 */

/** [CALIDAD 1] B1 · cuánto trabaja el horno en cada momento libre (ms): lejos de un cuadro largo. */
const PRESUPUESTO_DEL_HORNO_MS = 6

/**
 * [CALIDAD 1] B1 · hornea un campo en momentos libres, con presupuesto: ninguna tarea larga al cargar (antes, dos de
 * ~90 ms). Sin `requestIdleCallback`, en tareas sueltas del mismo presupuesto. Avisa con el campo terminado.
 */
export function hornearDeAPoco(horno: ReturnType<typeof campoDeAPoco>, listo: (ms: number) => void): void {
  const t0 = performance.now()
  const seguir = (plazo?: IdleDeadline): void => {
    // Con la GPU al límite casi no hay momentos libres: si vence la espera, el presupuesto entero igual.
    const ms = plazo === undefined || plazo.didTimeout ? PRESUPUESTO_DEL_HORNO_MS : Math.min(PRESUPUESTO_DEL_HORNO_MS, Math.max(2, plazo.timeRemaining() - 1))
    if (horno.paso(ms)) listo(Math.round(performance.now() - t0))
    else if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(seguir, { timeout: 60 })
    else window.setTimeout(seguir, 0)
  }
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(seguir, { timeout: 60 })
  else window.setTimeout(seguir, 0)
}

/** [ESCENA 8] T5 · las mallas del logo en el espacio de su grupo (el que lee la simulación con `uLogoInverso`). */
export function mallasDelLogo(grupo: THREE.Group): MallaDelLogo[] {
  grupo.updateMatrixWorld(true)
  const inversa = grupo.matrixWorld.clone().invert()
  const mallas: MallaDelLogo[] = []
  grupo.traverse((o) => {
    if (!(o instanceof THREE.Mesh) || !(o.geometry instanceof THREE.BufferGeometry)) return
    const posicion = o.geometry.getAttribute('position')
    if (posicion === undefined) return
    mallas.push({ posiciones: posicion.array, indices: o.geometry.index?.array ?? null, matriz: inversa.clone().multiply(o.matrixWorld) })
  })
  return mallas
}

/** Lo que el banco lee de un campo horneado: cuánto tardó, sus celdas y los tramos del contorno. */
export interface MedidaDelCampo {
  readonly ms: number
  readonly celdas: number[]
  readonly tramos: number
}

/** [CALIDAD 1] B2: uno solo, escribible, que el cuadro rellena. */
export interface Paso {
  conchas: readonly THREE.Matrix4[]
  camara: THREE.Vector3
  adelante: THREE.Vector3
  dt: number
  reloj: number
  posarse: number
  quieto: number
  desperto: number
  origen: readonly [number, number, number]
  remolino: number
  movimiento: number
}

export function pasoInicial(): Paso {
  const cero = new THREE.Vector3()
  return { conchas: [], camara: cero, adelante: cero, dt: 0, reloj: 0, posarse: 0, quieto: 0, desperto: 0, origen: [0, 0, 0], remolino: 0, movimiento: 0 }
}

export function alPaso(u: Record<string, THREE.IUniform>, p: Paso): void {
  const conchas = u.uConcha.value as THREE.Matrix4[]
  for (let i = 0; i < p.conchas.length; i += 1) conchas[i].copy(p.conchas[i])
  ;(u.uCamara.value as THREE.Vector3).copy(p.camara)
  ;(u.uAdelante.value as THREE.Vector3).copy(p.adelante)
  u.uDt.value = p.dt
  u.uReloj.value = p.reloj
  u.uPosarse.value = p.posarse
  u.uQuieto.value = p.quieto
  u.uDesperto.value = p.desperto
  ;(u.uOrigen.value as THREE.Vector3).set(p.origen[0], p.origen[1], p.origen[2])
  u.uRemolino.value = p.remolino
  u.uMovimiento.value = p.movimiento
}

/** Un paso de la simulación (medido si el banco lo pidió), con la pasada armada una vez ([CALIDAD 1] B2). */
export function correr(armado: ReturnType<typeof armar>, gl: THREE.WebGLRenderer): void {
  armado.gl.current = gl
  armado.cronometro.correr(gl, armado.pasar)
}

export function publicar(textura: THREE.Texture): void {
  AIRE.uFisica.value = textura
}

export function armar() {
  const posiciones = posicionesDelPolvoParejo()
  const cuantas = posiciones.length / 3
  const ancho = FISICA.ancho
  const alto = Math.ceil(cuantas / ancho)
  const origenes = new Float32Array(ancho * alto * 4)
  const conchas = conchasDelPolvoParejo(cuantas)
  for (let k = 0; k < cuantas; k += 1) origenes.set([posiciones[k * 3], posiciones[k * 3 + 1], posiciones[k * 3 + 2], conchas[k]], k * 4)
  const texturaDeOrigenes = new THREE.DataTexture(origenes, ancho, alto, THREE.RGBAFormat, THREE.FloatType)
  texturaDeOrigenes.needsUpdate = true
  const sim = crearPingPong(
    ancho,
    alto,
    2,
    SIMULACION_DEL_POLVO_GLSL,
    {
      uOrigenes: { value: texturaDeOrigenes },
      uCuantas: { value: cuantas },
      uConcha: { value: [new THREE.Matrix4(), new THREE.Matrix4(), new THREE.Matrix4()] },
      uCamara: { value: new THREE.Vector3() },
      uAdelante: { value: new THREE.Vector3(0, 0, -1) },
      uDeriva: AIRE.uDeriva,
      uDt: { value: 0 },
      uReloj: { value: 0 },
      uPosarse: { value: 0 },
      uQuieto: { value: 1e9 },
      uDesperto: { value: -1e9 },
      uOrigen: { value: new THREE.Vector3() },
      uRemolino: { value: 0 },
      uMovimiento: { value: 0 },
      uVientoDelAire: AIRE.uVientoDelAire,
      uPisoVivo: PISO_EN_VIVO.uPisoVivo,
      uGrillaDelPiso: PISO_EN_VIVO.uGrillaDelPiso,
      uLogo: AIRE.uLogo,
      uLogoInverso: AIRE.uLogoInverso,
      // [ESCENA 8] T5: el campo de la malla real (donde se posa el polvo que cae sobre el logo).
      ...CAMPO_EN_VIVO,
    },
    true,
  )
  const gl = { current: null as THREE.WebGLRenderer | null }
  return {
    cuantas,
    sim,
    gl,
    // [CALIDAD 1] B2: la pasada de la simulación, armada una vez (el cronómetro la corre en cada cuadro).
    pasar: (): void => {
      if (gl.current !== null) sim.paso(gl.current)
    },
    cronometro: crearCronometro(),
    soltar: () => {
      sim.soltar()
      texturaDeOrigenes.dispose()
    },
  }
}
