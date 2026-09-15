/**
 * LA CÁMARA CON EL CODO — el CONTRAFACTUAL de la fórmula vieja del encuadre.
 *
 * ⚠ **Este archivo NO se escanea por tokens.** Es un instrumento: sus números
 * son coordenadas de cuadro y unidades de mundo, no valores de diseño.
 *
 * ── ⚠️ ESTE ARCHIVO CAMBIÓ DE SUJETO: ANTES ERA LA CÁMARA BUENA ────────────
 *
 * Nació en SITIO-S11 como un freno declarado. El defecto 14 —`travelX` con un
 * codo en cero, §7.40— se arregló en `_lib/escena/encuadre.ts`, que es de donde
 * el rig saca su recorrido, pero **la fórmula estaba escrita DOS veces**:
 * `probe-escena/__tests__/harness.ts` la reimplementaba a mano, y aquel frente
 * tenía PROHIBIDO escribir en `/probe-escena`. Así que acá se componía
 * `camaraEnCuadro` —la posición del arnés con el recorrido de producción— para
 * poder medir con la cámara que el sitio usa de verdad, y el docblock dejaba
 * escrito el arreglo verdadero: *«que `harness.ts` importe `recorridoDeEncuadre`
 * de `encuadre.ts` —que es three-free justamente para eso— y que este archivo
 * desaparezca»*.
 *
 * **La primera mitad se ejecutó: `harness.ts` consume `recorridoDeEncuadre`.**
 * La segunda no se puede: `camaraEnCuadro` sí desapareció —después de unificar
 * era `cameraAt` con otro nombre, y afirmar que dos nombres de la misma función
 * coinciden es verde por construcción— pero de este archivo cuelgan dos piezas
 * que no tienen otro lugar:
 *
 *   · **`recorridoConCodo`** — el TESTIGO declarado de la fórmula vieja. Sin él,
 *     §7 de `s10-logo` se queda sin contrafactual y su control positivo no puede
 *     probar que el comparador ve la diferencia.
 *   · **`mismaCamara`** — el comparador de dos cámaras, que ese mismo §7 usa.
 *
 * Y borrarlo pondría en rojo `test:s11-frontera`: es una de las quince ALTAS de
 * SITIO-S11 cuya presencia en disco se afirma.
 *
 * Así que lo que queda acá es **la cámara del ANTES**, no la del después. Es la
 * misma composición de siempre, con el recorrido viejo en vez del bueno, y sirve
 * para lo único que un contrafactual sirve: que las afirmaciones del arreglo no
 * se comparen contra sí mismas.
 *
 * ── LO QUE HACE HONESTA A LA COMPOSICIÓN: la equivalencia arriba del codo ──
 *
 * `abs(h − m/2)` y `max(0, h − m/2)` devuelven el **mismo número** siempre que
 * el argumento sea positivo, o sea en todo aspecto arriba del aspecto de
 * recorrido nulo. Ahí `cameraAt` y `camaraConCodo` tienen que dar componentes
 * idénticas hasta el último bit, y abajo tienen que separarse. Las dos cosas las
 * afirma §7 de `s10-logo.invariant.ts`. Si esta composición se hubiera
 * equivocado en un signo o en el orden de la base, la primera no cerraría.
 */

import { FRAME_TRAVEL_SAFETY, LOGO_H, LOGO_W, TAN_HALF_V, cameraAt, cross, norm, sub, type CameraFrame, type Track, type Vec3 } from '@/app/probe-escena/__tests__/harness'
import type { MutableChoreoPose } from '../choreographyTypes'

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

/**
 * LA CÁMARA DEL ANTES — `cameraAt` apuntada con el recorrido que tenía el codo.
 *
 * Misma firma y misma forma de vuelta que `cameraAt`: se puede intercambiar sin
 * tocar a quien la llama. Cuando la pose no encuadra —`frameX` y `frameY` en
 * cero— devuelve lo del arnés sin tocarlo, porque ahí no hay nada que apuntar y
 * las dos fórmulas son inalcanzables.
 *
 * ⚠ **Reproduce `cameraAt` línea por línea salvo esa llamada**, a propósito: si
 * copiara algo más, la diferencia que §7 mide dejaría de ser atribuible al
 * recorrido.
 */
export function camaraConCodo(
  pista: Track,
  progreso: number,
  aspecto: number,
  salida: MutableChoreoPose,
): CameraFrame {
  const camara = cameraAt(pista, progreso, aspecto, salida)
  if (salida.frameX === 0 && salida.frameY === 0) return camara

  const medioAlto = TAN_HALF_V * camara.eyeDistance
  const recorridoX = recorridoConCodo(medioAlto * aspecto, LOGO_W)
  const recorridoY = recorridoConCodo(medioAlto, LOGO_H)

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

/** ¿Las dos cámaras coinciden en posición y en las tres direcciones de pantalla? */
export function mismaCamara(a: CameraFrame, b: CameraFrame, tolerancia = 1e-12): boolean {
  const ejes: readonly (keyof CameraFrame)[] = ['position', 'right', 'up', 'forward']
  return ejes.every((eje) => {
    const va = a[eje] as Vec3
    const vb = b[eje] as Vec3
    return va.every((componente, i) => Math.abs(componente - vb[i]) <= tolerancia)
  })
}
