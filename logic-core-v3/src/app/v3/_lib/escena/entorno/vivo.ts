import * as THREE from 'three'

import type { NivelDelHaz } from '../entorno'

/**
 * [ESCENA 3] Lo que las ideas del entorno comparten por cuadro. Lo escribe `Entorno.tsx` después
 * del rig; lo leen los materiales (el haz, el pulso, el polvo, el bokeh) y la sombra.
 */

/** Cuántos anillos del pulso puede dibujar el shader a la vez: el tope de `maquinaDelPulso.ts`. */
export const ANILLOS_EN_EL_SHADER = 4
/** Cuántas cajas de texto atenúan el pulso a la vez (las más grandes en pantalla). */
export const CAJAS_DE_TEXTO = 6

export const VIVO = {
  /** Segundos de reloj de la escena (quieto con movimiento reducido). */
  uTiempo: { value: 0 },
  /** 0 de día, 1 de noche: el mismo nivel que ya aclara las motas (`particleGlow.ts`). */
  uNoche: { value: 0 },
  /** E6 · una copia AMORTIGUADA de la vista-proyección: la estela es la distancia a ella. */
  uVPPrevio: { value: new THREE.Matrix4() },
  /** El búfer de dibujo, en píxeles de dispositivo. */
  uResolucion: { value: new THREE.Vector2(1, 1) },
  /** E6 · ganancia de la estela (0 = sin estela, p. ej. con movimiento reducido). */
  uEstela: { value: 0 },
  /** E7 · el cursor en NDC, amortiguado, y cuánto empuja (sube con la velocidad y se apaga). */
  uCursor: { value: new THREE.Vector2(9, 9) },
  uEmpuje: { value: 0 },
  uAspecto: { value: 1 },
  /** E7 · el alcance: radio² en NDC, profundidad de referencia y piso del peso (`ALCANCE_DEL_CURSOR`). */
  uCursorAlcance: { value: new THREE.Vector3(0.06, 10, 0) },
  /** E1 · 1 si el haz está prendido: el polvo lo lee para saber si hay columna. */
  uHaz: { value: 0 },
  /** E1 · cuánto se nota el haz: (columna, mancha en el piso, polvo), de día y de noche. */
  uHazDia: { value: new THREE.Vector3() },
  uHazNoche: { value: new THREE.Vector3() },
  /** E4 · los anillos vivos: (nace, duración, alcance, amplitud); amplitud 0 = vacío. */
  uAnillos: { value: Array.from({ length: ANILLOS_EN_EL_SHADER }, () => new THREE.Vector4()) },
  /** E4 · las cajas de texto en pantalla, en píxeles del búfer (x0, y0, x1, y1), abajo-izquierda. */
  uTexto: { value: Array.from({ length: CAJAS_DE_TEXTO }, () => new THREE.Vector4(-1, -1, -1, -1)) },
  /** E4 · el borde suave de la atenuación alrededor de cada caja, en píxeles del búfer. */
  uPluma: { value: 24 },
}

/**
 * Lo que no es uniform pero también se comparte: cuándo nació el último principal (la sombra) y
 * [ESCENA 4] si el puntero está sobre el logo, tal como lo decide E4 (F-mirada lo lee, no lo decide).
 */
export const PULSO_VIVO = { ultimoPrincipal: -Infinity, hover: false }

/** E1 · el haz: vertical, sobre el logo, del óculo al piso. Lo usan el cono y el polvo. */
export const HAZ = {
  arriba: 40,
  radioArriba: 2.2,
  radioAbajo: 6.2,
} as const

/**
 * E1 · LOS DOS NIVELES DEL HAZ — (columna, mancha en el piso, polvo dentro del haz).
 *
 * - **Noche**: el `medio` es la mitad de ESCENA 2 (0,16 / 0,2 / 0,9): luz ambiente, no un foco.
 * - **Día**: sobre papel blanco la luz aditiva casi no suma, así que la columna se lee por el
 *   polvo que la cruza (más grande y ámbar) y por una mancha de luz suave en el piso, que todavía
 *   tiene margen hasta el blanco.
 */
export const NIVELES_DEL_HAZ: Readonly<Record<NivelDelHaz, { readonly dia: readonly [number, number, number]; readonly noche: readonly [number, number, number] }>> = {
  sutil: { dia: [0.045, 0.05, 0.4], noche: [0.05, 0.06, 0.3] },
  medio: { dia: [0.07, 0.09, 0.62], noche: [0.08, 0.1, 0.45] },
}

/**
 * E7 · EL ALCANCE DEL CURSOR — radio² del círculo de influencia en NDC, la profundidad a la que el
 * peso vale 1 y el peso mínimo que conserva el polvo lejano. Es el nivel A de ESCENA 3: el polvo
 * cercano, en un círculo chico.
 */
export const ALCANCE_DEL_CURSOR: readonly [number, number, number] = [0.06, 10, 0]
