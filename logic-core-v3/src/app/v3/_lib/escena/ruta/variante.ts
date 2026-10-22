/**
 * [B12a.3] LA RANURA DE VARIANTES — los tipos que importa una variante de página y las constantes de la ranura (`docs/rediseno/B12a-API.md`
 * §4). Sólo tipos y números: ningún valor de three ni de react (lo importa servicios, y nada de esto puede entrar en la carga inicial).
 *
 * Una variante es un componente de R3F que la ranura (`RanuraDeLaVariante.tsx`, adentro del lienzo) monta en la intro de su página. Lee lo
 * que le da la ranura en su `useFrame` y escribe SÓLO lo que la ranura le presta (la luz de abajo, el color de la energía): nunca la cámara,
 * la luz de la sala, el progreso del rig ni el avance.
 */
import type { ComponentType } from 'react'
import type * as THREE from 'three'

import type { NivelDeCalidad } from '../calidad'

export interface PropsDeLaVariante {
  /** El avance de la intro, 0 → 1. Se lee en el `useFrame` (`avance.current`): la variante no se re-renderiza por cuadro. */
  readonly avance: Readonly<{ current: number }>
  /** El claro del acento de la página, leído del token una vez por montaje (blanco si la página no tiene acento). */
  readonly acento: THREE.Color
  /** 'plena' o 'compacta' (abajo de 1024, o con la GPU chica): `esc/calidad.ts`. */
  readonly calidad: NivelDeCalidad
  /** Movimiento reducido: el estado final, quieto; la salida, inmediata. */
  readonly reducido: boolean
  /**
   * [P-H29a · P-H29b] Enciende la luz de abajo del piso (la del pie: las juntas y el plano de debajo) en la intro, en el `useFrame`: su
   * energía, de 0 (apagada) a 1 (la del pie con todo su poder; la composición es `COMPOSICION_DE_LA_LUZ.brilloDelPiso`), y su color (blanco
   * de base; hacia el acento: es luz, nunca superficie). Un dueño por tramo: en la intro, la ranura (y con ella la variante); en el pie, el
   * final (B13). Sin llamarla, queda la de la composición.
   */
  readonly luzDeAbajo: (energia: number, color: THREE.Color) => void
  /** [P-H29c] Tiñe la energía de noche (las brasas, los arcos y la red: `uLuzNoche`; blanco de base), en el `useFrame`. */
  readonly energia: (color: THREE.Color) => void
  /**
   * [P-H29d] La salida: pasa a `true` cuando la página se va. La variante tiene `SALIDA_DE_LA_VARIANTE_MS` para volver a la composición
   * (la luz y el color de base); después la ranura la desmonta. Con movimiento reducido, la vuelta es inmediata.
   */
  readonly saliendo: Readonly<{ current: boolean }>
  /**
   * [B13] La resolución, 0 → 1: la señal del tramo del pie (el cierre de la página, `cierreDeLaPagina.ts`). 0 en la intro y en el cuerpo;
   * de 0 a 1 en la pantalla que sigue al CTA (al subir, vuelve). En 1 la variante está RESUELTA: lo que movió, en reposo, y su luz de abajo y
   * su energía, las de la composición (`COMPOSICION_DE_LA_LUZ`, blancas): el piso queda liso y calmo, y recién ahí entra el pie. En el cierre
   * la luz y la energía siguen siendo de la ranura (un dueño por tramo); con movimiento reducido, sin el paso intermedio.
   */
  readonly resolucion: Readonly<{ current: number }>
}

export type ComponenteDeVariante = ComponentType<PropsDeLaVariante>

/** El criterio de la ranura: lo que puede costar una variante de CPU por cuadro, medido en el build de producción (D7). */
export const PRESUPUESTO_DE_LA_VARIANTE = { cpuMsPorCuadro: 0.5 } as const

/** [P-H29d] Lo que espera la ranura, desde que la página se va, antes de desmontar la variante: termina antes del velo (760 ms). */
export const SALIDA_DE_LA_VARIANTE_MS = 420

/**
 * [P-H29f] LA LUZ DE LA COMPOSICIÓN COMPARTIDA — la del avance 0 de todas las páginas, definida por el home: de noche entera y el piso
 * apenas encendido. La ranura la pone en la intro de toda página (con o sin variante); una variante arranca de acá y vuelve acá al salir.
 */
export const COMPOSICION_DE_LA_LUZ = { noche: 1, brilloDelPiso: 0.12 } as const
