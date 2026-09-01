/**
 * LA CÁMARA CON EL ENCUADRE DE PRODUCCIÓN — el arnés, apuntado con la fórmula
 * que corre en el rig y no con la copia que quedó del otro lado.
 *
 * ⚠ **Este archivo NO se escanea por tokens.** Es un instrumento: sus números
 * son coordenadas de cuadro y unidades de mundo, no valores de diseño.
 *
 * ── POR QUÉ EXISTE, y es un freno declarado de SITIO-S11 ───────────────────
 *
 * El defecto 14 —`travelX` con un codo en cero, §7.40— se arregla en
 * `_lib/escena/encuadre.ts`, que es de donde el rig (`cameraFraming.ts` →
 * `OrbitRig.tsx`) saca su recorrido. Pero **la fórmula está escrita DOS veces en
 * el repo**: `probe-escena/__tests__/harness.ts:93-94` la reimplementa a mano,
 * con su razón escrita —importar `cameraFraming.ts` arrastraría `three` a node
 * para hacer tres productos vectoriales— y con la promesa de que *«la aritmética
 * es idéntica»*.
 *
 * Arreglar una sola de las dos rompe esa promesa, y **este frente no puede
 * escribir en `/probe-escena`**: el arreglo verdadero es que `harness.ts`
 * importe `recorridoDeEncuadre` de `encuadre.ts` —que es three-free justamente
 * para eso— y que este archivo desaparezca. Queda reportado.
 *
 * Mientras tanto, un instrumento que midiera con la fórmula vieja estaría
 * midiendo una cámara que producción ya no usa. Acá se compone: **posición y
 * pose salen de `cameraAt`, el recorrido sale de `encuadre.ts`, y la base de
 * pantalla se rearma con los MISMOS vectores primitivos que exporta el arnés**
 * (`sub`, `norm`, `cross`), en el mismo orden en que `Object3D.lookAt` construye
 * la suya.
 *
 * ── LO QUE HACE HONESTA A LA COMPOSICIÓN: la equivalencia arriba del codo ──
 *
 * `abs(h − m/2)` y `max(0, h − m/2)` devuelven el **mismo número** siempre que
 * el argumento sea positivo, o sea en todo aspecto arriba del codo. Ahí las dos
 * cámaras tienen que dar componentes idénticas hasta el último bit, y eso es
 * comprobable: `mismaCamara` lo compara y `s10-logo.invariant.ts` §2 y §7 lo
 * afirman —a 16/9 contra `muestrearCuadro`, que sigue usando `cameraAt` tal
 * cual—. Si esta composición se hubiera equivocado en un signo o en el orden de
 * la base, esa comparación no cerraría.
 */

import { recorridoDeEncuadre } from '../encuadre'
import type { MutableChoreoPose } from '../choreographyTypes'
import {
  FRAME_TRAVEL_SAFETY,
  LOGO_H,
  LOGO_W,
  TAN_HALF_V,
  cameraAt,
  cross,
  norm,
  sub,
  type CameraFrame,
  type Track,
  type Vec3,
} from '@/app/probe-escena/__tests__/harness'

/**
 * La base que `Object3D.lookAt` construye — `z = normalize(eye − target)`,
 * `x = normalize(cross(up, z))`, `y = cross(z, x)`—, armada con los primitivos
 * que exporta el arnés para que no haya una tercera aritmética de vectores.
 */
function baseDeLookAt(posicion: Vec3, objetivo: Vec3) {
  const z = norm(sub(posicion, objetivo))
  const x = norm(cross([0, 1, 0], z))
  const y = cross(z, x)
  return { right: x, up: y, forward: [-z[0], -z[1], -z[2]] as Vec3 }
}

/**
 * La cámara en un progreso, apuntada con el recorrido de PRODUCCIÓN.
 *
 * Misma firma y misma forma de vuelta que `cameraAt`: se puede intercambiar sin
 * tocar a quien la llama. Cuando la pose no encuadra —`frameX` y `frameY` en
 * cero— devuelve lo del arnés sin tocarlo, porque ahí no hay nada que apuntar.
 */
export function camaraEnCuadro(
  pista: Track,
  progreso: number,
  aspecto: number,
  salida: MutableChoreoPose,
): CameraFrame {
  const camara = cameraAt(pista, progreso, aspecto, salida)
  if (salida.frameX === 0 && salida.frameY === 0) return camara

  const medioAlto = TAN_HALF_V * camara.eyeDistance
  const recorridoX = recorridoDeEncuadre(medioAlto * aspecto, LOGO_W)
  const recorridoY = recorridoDeEncuadre(medioAlto, LOGO_H)

  const base = baseDeLookAt(camara.position, [0, 0, 0])
  const mira: Vec3 = [
    base.right[0] * -salida.frameX * recorridoX + base.up[0] * -salida.frameY * recorridoY,
    base.right[1] * -salida.frameX * recorridoX + base.up[1] * -salida.frameY * recorridoY,
    base.right[2] * -salida.frameX * recorridoX + base.up[2] * -salida.frameY * recorridoY,
  ]

  return {
    position: camara.position,
    ...baseDeLookAt(camara.position, mira),
    eyeDistance: camara.eyeDistance,
    pose: { ...salida },
  }
}

/**
 * EL RECORRIDO CON EL CODO — la fórmula VIEJA, viva sólo acá y sólo como
 * testigo.
 *
 * No la usa nadie para medir: existe para que el §7 pueda publicar el antes y el
 * después con las dos cifras al lado, y para que el control positivo pueda
 * comprobar que el comparador **ve la diferencia** en vez de comparar la fórmula
 * nueva consigo misma. Borrarla dejaría el arreglo sin contrafactual.
 */
export function recorridoConCodo(medioCuadro: number, medidaDeLaCaja: number): number {
  return Math.max(0, medioCuadro - medidaDeLaCaja / 2) * FRAME_TRAVEL_SAFETY
}

/** ¿Las dos cámaras coinciden en posición y en las tres direcciones de pantalla? */
export function mismaCamara(a: CameraFrame, b: CameraFrame, tolerancia = 1e-12): boolean {
  const ejes: readonly (keyof CameraFrame)[] = ['position', 'right', 'up', 'forward']
  return ejes.every((eje) => {
    const va = a[eje] as Vec3
    const vb = b[eje] as Vec3
    return va.every((componente, i) => Math.abs(componente - vb[i]) <= tolerancia)
  })
}
