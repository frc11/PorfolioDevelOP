import * as THREE from 'three'

import type { Curva } from '../motion/curvas'
import { aimWithFraming } from './cameraFraming'
import { progresoDeLaCamara } from './camaraDeEntonces'
import { CHOREO_KEYFRAMES } from './choreography'
import { buildTrack, sampleTrack, type ChoreoTrack } from './choreographySampler'
import type { MutableChoreoPose } from './choreographyTypes'
import { medirLasSecciones } from './extensionDeLasSecciones'
import { CAMERA_FOV, ORBIT_TARGET_Y } from './probeScene'
import { progresoDelScroll } from './recorrido'
import { medidaSinElEstiramiento } from './tramoEstirado'

/**
 * [PULIDO 2] 2 · EL VIAJE REPARTIDO POR LO QUE SE VE CAMBIAR. Con los viajes cortos (de 1,2 a 2,5 s del click a la llegada,
 * `deslizamiento.ts`) la curva del viaje (pareja en el scroll) dejaba los tramos donde la cámara gira mucho (la entrada al
 * túnel, el hero, Tu panel) en pocos cuadros: hasta 16° de cámara en un cuadro, medido a 1440. Ahora el viaje no reparte el
 * tiempo por los px sino por lo que cambia en cuadro: cada tramo cuesta lo que recorre la escena (en pantallas, sin el
 * túnel estirado) más lo que gira la cámara de la coreografía, con su encuadre (`gradosPorPantalla` grados cuestan como una pantalla), y la
 * curva del viaje (la del vocabulario) se aplica a ese costo. Donde la cámara gira, el scroll va más despacio; donde la sala
 * apenas cambia (adentro de una sección quieta), más rápido. Mismo destino, misma duración, mismas puntas quietas.
 */
export const REPARTO_DEL_VIAJE = { muestras: 160, gradosPorPantalla: 30 } as const

/** Las muestras de un viaje: cuánto recorre la escena (pantallas) y cuánto gira la cámara (°) entre cada una y la siguiente. */
export interface MuestrasDelViaje {
  readonly pantallas: readonly number[]
  readonly grados: readonly number[]
}

/**
 * La curva repartida: a la fracción de tiempo `t`, la fracción de la distancia en la que el COSTO recorrido es el que la
 * curva `base` pide. Las muestras son tramos iguales de distancia; sin costo (un viaje quieto), la curva base.
 */
export function curvaRepartida(m: MuestrasDelViaje, base: Curva): Curva {
  const n = m.pantallas.length
  const costo = [0]
  for (let i = 0; i < n; i += 1) costo.push(costo[i] + m.pantallas[i] + m.grados[i] / REPARTO_DEL_VIAJE.gradosPorPantalla)
  const total = costo[n]
  if (!(total > 0) || n === 0) return base
  return (t: number): number => {
    if (t <= 0) return 0
    if (t >= 1) return 1
    const meta = base(t) * total
    let [a, b] = [0, n]
    while (b - a > 1) {
      const medio = (a + b) >> 1
      if (costo[medio] <= meta) a = medio
      else b = medio
    }
    const tramo = costo[b] - costo[a]
    return (a + (tramo > 0 ? (meta - costo[a]) / tramo : 0)) / n
  }
}

let pista: ChoreoTrack | null = null
const POSE: MutableChoreoPose = { angleDeg: 0, height: 0, distance: 0, frameX: 0, frameY: 0 }
const CAMARA = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 500)
const VISTA = new THREE.Vector3()
/** La huella del logo de pie (u) con que el rig encuadra (la que publica la escena; acá, la del SVG a su escala). */
const LOGO = { ancho: 6.9, alto: 4.78 }

/** La dirección de la vista de la cámara de la coreografía en el progreso de la escena `p`: la del rig, con su encuadre. */
function direccionEn(p: number, aspecto: number, salida: [number, number, number]): void {
  pista ??= buildTrack(CHOREO_KEYFRAMES)
  sampleTrack(pista, progresoDeLaCamara(p), POSE)
  const a = (POSE.angleDeg * Math.PI) / 180
  CAMARA.position.set(Math.sin(a) * POSE.distance, POSE.height, Math.cos(a) * POSE.distance)
  CAMARA.lookAt(0, ORBIT_TARGET_Y, 0)
  if (POSE.frameX !== 0 || POSE.frameY !== 0) aimWithFraming(CAMARA, aspecto, LOGO.ancho, LOGO.alto, Math.hypot(POSE.distance, POSE.height - ORBIT_TARGET_Y), POSE.frameX, POSE.frameY)
  CAMARA.getWorldDirection(VISTA)
  salida[0] = VISTA.x
  salida[1] = VISTA.y
  salida[2] = VISTA.z
}

/** Las muestras del viaje desde el scroll de ahora hasta `y1` (px del documento), medidas en el documento. */
export function muestrasDelViaje(y1: number): MuestrasDelViaje | null {
  const v = window.innerHeight
  const y0 = window.scrollY
  const secciones = medirLasSecciones(document, y0)
  if (secciones === null || !(v > 0) || y1 === y0) return null
  const n = REPARTO_DEL_VIAJE.muestras
  const pantallas: number[] = []
  const grados: number[] = []
  const antes: [number, number, number] = [0, 0, 0]
  const ahora: [number, number, number] = [0, 0, 0]
  const medida = { y: 0, abajo: 0 }
  let yAntes = 0
  for (let i = 0; i <= n; i += 1) {
    const m = medidaSinElEstiramiento(y0 + ((y1 - y0) * i) / n, secciones.abajo, y0, v, medida)
    direccionEn(progresoDelScroll(m.y, secciones.arriba, m.abajo, v), window.innerWidth / v, ahora)
    if (i > 0) {
      pantallas.push(Math.abs(m.y - yAntes) / v)
      const coseno = Math.min(1, Math.max(-1, antes[0] * ahora[0] + antes[1] * ahora[1] + antes[2] * ahora[2]))
      grados.push((Math.acos(coseno) * 180) / Math.PI)
    }
    yAntes = m.y
    antes[0] = ahora[0]
    antes[1] = ahora[1]
    antes[2] = ahora[2]
  }
  return { pantallas, grados }
}

/** La curva del viaje hasta `y1`, repartida por lo que se ve cambiar; si no se puede medir, la base. */
export function curvaDelViaje(y1: number, base: Curva): Curva {
  const m = muestrasDelViaje(y1)
  return m === null ? base : curvaRepartida(m, base)
}
