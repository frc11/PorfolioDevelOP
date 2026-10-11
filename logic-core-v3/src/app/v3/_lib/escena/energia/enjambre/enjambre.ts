import * as THREE from 'three'

import { crearCronometro, type Cronometro } from '../../gpu/cronometro'
import { crearPingPong, type PingPong } from '../../gpu/pingPong'
import { CAMPO_EN_VIVO } from '../../polvo/campoDelLogo'
import { ARCOS } from '../arcos/arcos'
import { AJUSTES_DEL_ENJAMBRE, ENJAMBRE, SIMULACION_DEL_ENJAMBRE_GLSL, type AjustesDelEnjambre } from './simulacion'

/**
 * [PULIDO 17] O3 · EL ENJAMBRE ARMADO (`simulacion.ts`: el sombreador). El ping-pong de la escena (32 bits por canal, dos salidas),
 * sus uniformes (el cuadro las escribe: `cuadro.ts`) y el paso de cada cuadro. Nace en el primer paso (todas las motas en la
 * cáscara, con edades al azar: no renacen todas a la vez) y desde ahí cada una renace sola al terminar su vida.
 */
export function uniformesDelEnjambre(ajustes: AjustesDelEnjambre = AJUSTES_DEL_ENJAMBRE) {
  const v = (x: readonly number[]): { value: THREE.Vector4 } => ({ value: new THREE.Vector4(x[0], x[1], x[2], x[3]) })
  return {
    uFlujo: v(ajustes.uFlujo),
    uNucleosAjuste: v(ajustes.uNucleosAjuste),
    uReparto: v(ajustes.uReparto),
    uEnergiaAjuste: v(ajustes.uEnergiaAjuste),
    uCursorAjuste: v(ajustes.uCursorAjuste),
    uSuperficie: v(ajustes.uSuperficie),
    uLogo: { value: new THREE.Matrix4() },
    uPiso: { value: -100 },
    uDt: { value: 0 },
    uTiempo: { value: 0 },
    uTemperatura: { value: 0 },
    uNacer: { value: 1 },
    uCuadro: { value: 0 },
    uNucleos: { value: Array.from({ length: ENJAMBRE.nucleos.maximo }, () => new THREE.Vector4()) },
    uCuantosNucleos: { value: 0 },
    uRayoO: { value: new THREE.Vector3() },
    uRayoD: { value: new THREE.Vector3(0, 0, 1) },
    uPuntero: { value: new THREE.Vector2() },
    uPulsos: { value: [new THREE.Vector4(0, 0, 0, -1), new THREE.Vector4(0, 0, 0, -1)] },
    uFrentes: { value: [new THREE.Vector4(), new THREE.Vector4()] },
    uArcosA: { value: Array.from({ length: ARCOS.lugares }, () => new THREE.Vector4()) },
    uArcosB: { value: Array.from({ length: ARCOS.lugares }, () => new THREE.Vector4()) },
    uCuantosArcos: { value: 0 },
    uCentro: { value: new THREE.Vector3() },
    uLogoInverso: { value: new THREE.Matrix4() },
    uActividadDelLogo: { value: 0 },
  }
}
export type UniformesDelEnjambre = ReturnType<typeof uniformesDelEnjambre>

export interface Enjambre {
  readonly lado: number
  readonly cuantas: number
  readonly ping: PingPong
  readonly u: UniformesDelEnjambre
  /** Lo que leen las partículas: la textura de las posiciones (y la energía) y la de las velocidades (y la edad) del último paso. */
  readonly lugares: { value: THREE.Texture | null }
  readonly velocidades: { value: THREE.Texture | null }
  /** El banco mide en la GPU cuánto tarda la simulación (`cronometro.pedir`); la pasada se arma una vez (sin reservas por cuadro). */
  readonly cronometro: Cronometro
  readonly pasada: () => void
  readonly renderer: { actual: THREE.WebGLRenderer | null }
}

export function crearEnjambre(lado: number, ajustes: AjustesDelEnjambre): Enjambre {
  const u = uniformesDelEnjambre(ajustes)
  const ping = crearPingPong(lado, lado, 2, SIMULACION_DEL_ENJAMBRE_GLSL, { ...u, ...CAMPO_EN_VIVO }, true)
  const renderer: { actual: THREE.WebGLRenderer | null } = { actual: null }
  const pasada = (): void => {
    if (renderer.actual !== null) ping.paso(renderer.actual)
  }
  return { lado, cuantas: lado * lado, ping, u, lugares: { value: null }, velocidades: { value: null }, cronometro: crearCronometro(), pasada, renderer }
}

/** Un paso (las uniformes ya escritas): corre la simulación y deja el estado nuevo para el dibujo. */
export function pasoDelEnjambre(e: Enjambre, gl: THREE.WebGLRenderer, dt: number): void {
  e.u.uDt.value = dt
  e.renderer.actual = gl
  e.cronometro.correr(gl, e.pasada)
  e.u.uNacer.value = 0
  e.u.uCuadro.value = (e.u.uCuadro.value + 1) % 1e6
  const estado = e.ping.estado()
  e.lugares.value = estado[0]
  e.velocidades.value = estado[1]
}

export function soltarEnjambre(e: Enjambre): void {
  e.ping.soltar()
}
