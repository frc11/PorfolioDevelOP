/**
 * LOS NUEVE PATRONES — la coreografía de la referencia, como dato.
 *
 * 291 instancias de animación medidas, nueve patrones. Uno solo cubre el
 * 64,6 %; dos cubren el 90 %. SCROLL.md §3 los agrupa por ancla y §9.7 dice qué
 * anima cada uno. Este archivo es esas dos tablas, juntas y tipadas.
 *
 * ── De dónde sale cada número ──────────────────────────────────────────────
 *
 * De SCROLL.md, que es la especificación de este sprint. Donde la tabla de la
 * instrucción y SCROLL.md difieren, **gana SCROLL.md** —es la regla declarada
 * del propio sprint— y la diferencia queda anotada acá, en el patrón donde
 * ocurre, además de en el reporte. Son cinco:
 *
 *   P4  la instrucción no declara escalonado; SCROLL.md mide 0,2.
 *   P5  la instrucción no declara duración; SCROLL.md mide 1 s (en los hijos).
 *   P6  la instrucción dice `x` 280 → 0; SCROLL.md mide 140 → −140, que son los
 *       mismos 280 px de recorrido pero centrados, y agrega duración 2 s.
 *   P8  la instrucción no declara curva; SCROLL.md mide `power1.out`.
 *   P9  la instrucción no declara curva ni duración; SCROLL.md mide
 *       `power2.inOut` y 2 s.
 *
 * Y una sexta que no es de la tabla sino de la lista de curvas: la instrucción
 * escribe `power4.out` como `1 − (1−t)⁴`, que es una cuártica; en la
 * nomenclatura de GSAP `power4` es la QUÍNTICA. Ver `curvas.ts`.
 *
 * ── La regla de los números de este archivo ────────────────────────────────
 *
 * Los valores de acá son MEDICIONES de la referencia, no decisiones de diseño:
 * 120 no es un tamaño elegido, es el `yPercent` que se leyó del objeto vivo. Por
 * eso viven en un módulo tipado y no en `theme-develop.css`. El sistema visual
 * —color, tipografía, espaciado, duraciones de CSS— sigue viniendo entero de los
 * 89 tokens, y estos archivos no declaran ni un color ni una medida de layout.
 *
 * ── Por qué está partido en tres ───────────────────────────────────────────
 *
 * Este archivo tiene los TIPOS y el registro; los nueve patrones viven en dos
 * archivos según lo que animan, que es el mismo corte que separa su contenido en
 * el demo: `patrones-tipografia.ts` para los cuatro que mueven texto (P1, P2, P3
 * y P6) y `patrones-piezas.ts` para los cinco que mueven objetos (P4, P5, P7, P8
 * y P9). No es un corte por tamaño de archivo: es la distinción que ya usa el
 * sistema en `contenidosTexto.tsx` y `contenidosPiezas.tsx`.
 */

import type { ParDeAnclas } from './anclas'
import type { NombreDeCurva } from './curvas'
// Los dos archivos de datos importan de vuelta el tipo `Patron` de acá. Es un
// ciclo de TIPOS y no de valores: `import type` se borra al compilar, así que en
// tiempo de ejecución la dependencia va en un solo sentido.
import { P4, P5, P7, P8, P9 } from './patrones-piezas'
import { P1, P2, P3, P6 } from './patrones-tipografia'
import type { ClaveNumerica, ValorPointerEvents } from './traduccion'

export type IdDePatron = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7' | 'P8' | 'P9'

/** Una clave animada: de dónde a dónde. */
export interface Fotograma {
  readonly clave: ClaveNumerica
  readonly desde: number
  readonly hasta: number
}

/** La conmutación discreta de `pointerEvents`, cuando el patrón la tiene. */
export interface Conmutacion {
  readonly inicial: ValorPointerEvents
  readonly final: ValorPointerEvents
}

/**
 * Un tramo de una línea de tiempo. Solo P7 los usa: es el único patrón del
 * corpus que arma una timeline en vez de un tween suelto (2 de 244).
 */
export interface Tramo {
  readonly nombre: string
  /** Arranque dentro de la ventana del hijo, en proporción (0 a 1). */
  readonly desde: number
  /** Fin dentro de la ventana del hijo, en proporción (0 a 1). */
  readonly hasta: number
  readonly curva: NombreDeCurva
  readonly claves: readonly Fotograma[]
  readonly pointerEvents?: Conmutacion
}

/** Cuántas piezas tenía el patrón en la referencia. */
export interface PiezasMedidas {
  readonly min: number
  readonly max: number
  readonly nota: string
}

export interface Patron {
  readonly id: IdDePatron
  /** El nombre del sistema, en castellano. */
  readonly nombre: string
  /** Instancias en la referencia, sobre 244 (SCROLL.md §9.7). */
  readonly instancias: number
  /** El ancla medida (SCROLL.md §3). */
  readonly anclas: ParDeAnclas
  /**
   * El `scrub` declarado. `true` = sin inercia; un número = segundos que tarda
   * el cabezal en alcanzar la posición del scroll.
   */
  readonly scrub: number | true
  readonly curva: NombreDeCurva
  /** Segundos declarados por tween. NO es la duración aplicada: ver cronograma. */
  readonly duracionDeclarada: number
  /** Segundos entre el arranque de una pieza y el de la siguiente. */
  readonly escalonado: number
  /** Las claves que el autor declaró, tal cual las declaró. */
  readonly claves: readonly Fotograma[]
  readonly pointerEvents?: Conmutacion
  /** Solo P7. Cuando está, `claves` queda vacío y manda esto. */
  readonly tramos?: readonly Tramo[]
  readonly piezas: PiezasMedidas
  /** Qué etiquetas anima en la referencia. */
  readonly elementos: string
  /** El efecto, en una línea. */
  readonly efecto: string
  /** Perspectiva del ancestro, en px. Solo los dos patrones con 3D real. */
  readonly perspectivaPx?: number
  /** Diferencias contra la tabla de la instrucción, si las hay. */
  readonly discrepancia?: string
}

/** Los nueve, por id. */
export const PATRONES: Readonly<Record<IdDePatron, Patron>> = {
  P1,
  P2,
  P3,
  P6,
  P4,
  P5,
  P7,
  P8,
  P9,
}

/** Los nueve, en orden. */
export const ORDEN_DE_PATRONES: readonly IdDePatron[] = [
  'P1',
  'P2',
  'P3',
  'P4',
  'P5',
  'P6',
  'P7',
  'P8',
  'P9',
]

/** El total de instancias del corpus de §9.7. El invariante lo afirma. */
export const INSTANCIAS_MEDIDAS = 244
