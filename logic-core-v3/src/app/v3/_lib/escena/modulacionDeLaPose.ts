import { dampTowards } from './choreographySampler'
import {
  AZIMUT_DEL_MOUSE_POR_PROGRESO,
  MOUSE_ANGLE_DEG_MAXIMO,
  MOUSE_EPSILON,
  MOUSE_HEIGHT_FACTOR,
  MOUSE_TAU,
} from './choreographyPhysics'

/**
 * LA MODULACIÓN DE LA POSE — el desplazamiento del mouse, y NADA MÁS QUE ESO.
 *
 * ── ⚠️ POR QUÉ ESTE MÓDULO EXISTE: LO QUE NO PUEDE HACER ───────────────────
 *
 * La regla de arquitectura de B5, textual: *«la deriva, el asentamiento y el
 * mouse son un desplazamiento SOBRE LA POSE, nunca un cambio del progreso. Si
 * la cámara moviéndose sola altera el progreso, el anclaje se rompe y se caen
 * las 4.751 afirmaciones que descansan en él»*.
 *
 * Hasta B5 el offset de mouse vivía inline adentro del `useFrame` de
 * `OrbitRig`, **al lado del `rig.set('progress', …)`**, y lo único que impedía
 * que tocara el progreso era que nadie lo hubiera escrito. Acá no hace falta
 * confiar: **este módulo no recibe el store.** Sus dos funciones toman números
 * y devuelven números. No hay una referencia al rig, ni a `progress`, ni a
 * `set`. La garantía es de forma, no de disciplina — que es la diferencia entre
 * «se verificó que no lo escribe» y «no lo puede escribir».
 *
 * `b5-modulacion.invariant.ts` afirma las dos mitades: la de forma sobre el
 * fuente (cero importaciones del store, cero `set(`) y la de comportamiento
 * sobre el valor (el desplazamiento es función de sus argumentos y de nada más,
 * con control positivo).
 *
 * ── Qué NO entró acá, y la medición que lo decidió ─────────────────────────
 *
 * La instrucción de B5 pedía además una **deriva autónoma de cámara** —que la
 * escena se moviera sola— como la pieza «que seguro no existe». Se midió antes
 * de construirla y **la premisa era falsa por los dos lados**:
 *
 *   · **La referencia tampoco la tiene.** Con la página quieta y sin eventos de
 *     puntero, 5 s: su corrimiento horizontal es **0 px** en las tres bandas
 *     medidas. Lo que cambia en su pantalla es textura —aurora, agua,
 *     partículas—, no encuadre.
 *   · **Nosotros ya tenemos esa misma textura viva.** En la misma ventana y con
 *     el mismo instrumento: **29,8 % de los píxeles cambian más de 3 de
 *     luminancia, media 6,01, corrimiento 0 px** (la referencia: 36,8 % y
 *     5,86). Las partículas por conchas, el moiré de la envolvente y la vira
 *     del logo ya lo hacen.
 *
 * Lo que separa a la referencia de nosotros no era una deriva: era **el
 * paralaje de mouse**, ≥120 px contra 13. Por eso este módulo amplifica el
 * offset y no agrega un movimiento nuevo.
 *
 * ── El asentamiento tampoco entró, y por la misma razón ───────────────────
 *
 * Ya existe dos veces. La inercia por canal de `SETTLE_TAU` persigue la pose
 * del progreso (0,28 / 0,24 / 0,26 / 0,20 / 0,20 s), y desde B5 el **valor del
 * scroll** llega ya suavizado por Lenis. Las dos curvas de asentamiento del
 * scroll —la nuestra y la de la referencia— caen una encima de la otra: t63
 * 202 contra 166 ms, t95 543 contra 557, t99 771 contra 753. No había nada que
 * recalibrar.
 */

/**
 * El desplazamiento sobre la pose. **Dos canales y ninguno es el encuadre**: la
 * pose que el panel copia sigue siendo la del track, sin el mouse encima.
 */
export interface DesplazamientoDePose {
  angleDeg: number
  height: number
}

/** El puntero amortiguado, en el rango [−1, 1] de r3f. Estado del cuadro, no del render. */
export interface PunteroAmortiguado {
  x: number
  y: number
}

export function crearDesplazamiento(): DesplazamientoDePose {
  return { angleDeg: 0, height: 0 }
}

export function crearPuntero(): PunteroAmortiguado {
  return { x: 0, y: 0 }
}

/**
 * EL PUNTERO ARRASTRA, NO SALTA.
 *
 * Constante de tiempo propia (`MOUSE_TAU`), más lenta que la del track: el
 * offset llega después del contenido, no antes. La fórmula de `dampTowards` es
 * independiente del framerate, así que `MOUSE_TAU` significa lo mismo a 30 que
 * a 144 fps.
 *
 * ⚠️ Muta `estado` a propósito: corre una vez por cuadro y asignar un objeto
 * nuevo sería basura por cuadro. Es un scratchpad, no estado de React.
 */
export function perseguirAlPuntero(
  estado: PunteroAmortiguado,
  objetivoX: number,
  objetivoY: number,
  delta: number,
): void {
  estado.x = dampTowards(estado.x, objetivoX, MOUSE_TAU, MOUSE_EPSILON, delta)
  estado.y = dampTowards(estado.y, objetivoY, MOUSE_TAU, MOUSE_EPSILON, delta)
}

/** Devuelve el puntero a cero. Es lo que corresponde con la física apagada. */
export function soltarElPuntero(estado: PunteroAmortiguado): void {
  estado.x = 0
  estado.y = 0
}

/**
 * EL DESPLAZAMIENTO QUE EL MOUSE LE SUMA A LA POSE DEL PROGRESO.
 *
 * ── Por qué es RELATIVO y no absoluto ─────────────────────────────────────
 *
 * El azimut ya lo es —un grado se ve igual a 6,3 que a 30 de distancia—. La
 * altura se multiplica por la distancia para que el desplazamiento **en
 * pantalla** sea el mismo en toda la órbita; un offset fijo en unidades de
 * mundo sería un cimbronazo de cerca y nada de lejos.
 *
 * ── El signo ──────────────────────────────────────────────────────────────
 *
 * Es «mirar alrededor»: mouse a la derecha → la cámara se corre a la derecha y
 * se ve más del costado derecho del objeto. Invertirlo es cambiarle el signo a
 * las dos constantes de `choreographyPhysics.ts`.
 *
 * ⚠️ **`magnitud` es la perilla del humano** (`mouseScale` del rig, rango 0–3,
 * default 1). Se multiplica acá y no adentro de las constantes para que las
 * constantes sigan siendo el valor calibrado y la perilla siga siendo una
 * perilla.
 *
 * ⚠️ **Y `progreso` es lo que hace variable al azimut.** Cada tramo del
 * recorrido tiene su propio techo de contraste, y aplicar el mínimo global en
 * todos era regalar paralaje justo en la primera pantalla, que es la que se
 * juzga. La tabla y sus dos mediciones están en `choreographyPhysics.ts`.
 */
export function desplazamientoDelMouse(
  destino: DesplazamientoDePose,
  puntero: PunteroAmortiguado,
  distancia: number,
  magnitud: number,
  progreso: number,
): DesplazamientoDePose {
  destino.angleDeg = puntero.x * azimutDelMouseEn(progreso) * magnitud
  destino.height = puntero.y * MOUSE_HEIGHT_FACTOR * distancia * magnitud
  return destino
}

/**
 * EL AZIMUT QUE LE TOCA A ESTE PROGRESO — interpolación lineal entre los nudos.
 *
 * ── Por qué se interpola y no se escalona por tramo ───────────────────────
 *
 * Porque un escalón es un salto de cámara. Con el puntero en un extremo, cruzar
 * un borde de tramo con la amplitud escalonada movería el azimut de golpe —14°
 * entre el hero y el cierre— y eso se ve. La rampa lo reparte, y además vive
 * donde la escena no dibuja, así que no se ve ni repartida.
 *
 * Fuera de los extremos se clava en el nudo de la punta: el progreso vive en
 * [0, 1] y la tabla lo cubre, pero un valor fuera de rango no puede devolver
 * basura.
 */
export function azimutDelMouseEn(progreso: number): number {
  const tabla = AZIMUT_DEL_MOUSE_POR_PROGRESO
  if (progreso <= tabla[0][0]) return tabla[0][1]
  const ultimo = tabla[tabla.length - 1]
  if (progreso >= ultimo[0]) return ultimo[1]
  for (let i = 1; i < tabla.length; i += 1) {
    const [x1, y1] = tabla[i]
    if (progreso > x1) continue
    const [x0, y0] = tabla[i - 1]
    const t = x1 === x0 ? 0 : (progreso - x0) / (x1 - x0)
    return y0 + (y1 - y0) * t
  }
  return ultimo[1]
}

/**
 * La excursión de AZIMUT del peor caso, en grados. Es el techo de la tabla, y
 * existe para poder acotar lo que el mouse le suma al recorrido sin muestrear.
 */
export function excursionDeAzimut(magnitud: number): number {
  return Math.abs(MOUSE_ANGLE_DEG_MAXIMO * magnitud)
}

/** El desplazamiento nulo, para el cuadro en que la física no corre. */
export function sinDesplazamiento(destino: DesplazamientoDePose): DesplazamientoDePose {
  destino.angleDeg = 0
  destino.height = 0
  return destino
}

/**
 * LA EXCURSIÓN DE ALTURA EN EL PEOR CASO, para comprobarla contra el piso.
 *
 * ⚠️ **El canal de altura tiene un techo GEOMÉTRICO y está casi tocado.** En el
 * keyframe más bajo del recorrido —«quiénes somos», `height −3,6`, `distance
 * 11,5`— la cámara queda a `(height − FLOOR_Y) / distance` = **0,061217** de
 * irse abajo del papel, y `MOUSE_HEIGHT_FACTOR` vale **0,045**: quedan **1,36×**
 * de holgura y nada más. Por eso B5 amplificó el AZIMUT y **no tocó la altura**:
 * el paralaje que la referencia tiene de más es horizontal, y el canal vertical
 * no tiene de dónde sacarlo.
 *
 * `b5-modulacion.invariant.ts` recalcula ese techo contra los keyframes y el
 * `FLOOR_Y` reales, así que si alguien mueve una pose o el factor, se entera.
 */
export function excursionDeAltura(distancia: number, magnitud: number): number {
  return Math.abs(MOUSE_HEIGHT_FACTOR * distancia * magnitud)
}
