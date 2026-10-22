/**
 * [B12b] EL VIAJE DESDE EL CTA DE UN SERVICIO, VISTO DESDE LA ESCENA — puro, sin react, three ni DOM (lo leen el rig en su cuadro y la
 * atadura al scroll; lo escribe el viaje del DOM, `_componentes/navegacion/viajeAlServicio.ts`). El plan y el log, en
 * `docs/rediseno/SPRINT-B12B-NOCTURNO.md`; el criterio, en la skill (`CONTRATO.md` §Navegación): «el papel de la sección se levanta,
 * aparece la escena, anochece y la cámara llega a la composición inicial de la página».
 *
 * Mientras dura, con el preset de la página de destino apilado en el home (la escena se entera de adónde va: su pista, su noche, su acento y
 * su variante, que la ranura monta antes de que se vea), tres cosas cambian, y las tres salen de UN reloj:
 *   · la escena dibuja aunque el papel la tape (`viajeAlServicioEnCurso`, que lee la atadura): se ve la sala en cuanto el papel sube;
 *   · la cámara baja de la pose de partida (`POSE_DE_PARTIDA`: más alta y más lejos, de frente) a la composición inicial de la página
 *     (`mezclarConLaPartida`, sobre la pose de la pista y antes del encuadre del hueco: el logo va en su hueco durante todo el descenso);
 *   · la luz anochece (`nocheDelViaje`: la noche de la página entra de a poco, nunca de golpe).
 * Fuera del viaje el reloj vale 1 (la cámara y la luz, las de la página): nada cambia para nadie.
 */

import type { ChoreoPose, MutableChoreoPose } from '../choreographyTypes'

/** Los tiempos del viaje (ms, desde que arranca su reloj: la escena ya dibuja detrás del papel). */
export const TIEMPOS_DEL_VIAJE = {
  /** Lo más que se espera a la escena (despierta, con la variante del destino dibujada) antes de levantar el papel; si no, la banda. */
  esperaMaximaMs: 1500,
  /** Cuadros pintados con la escena lista antes de arrancar el reloj (el salto de la cámara a la partida queda tapado). */
  cuadrosDeAsiento: 3,
  /** El papel sube entero. */
  levantaMs: 760,
  /** Los nanobots se apagan (de entrada: van en el papel que sube). */
  apaganMs: 320,
  /** La noche entra en este tramo. */
  nocheDesdeMs: 160,
  nocheHastaMs: 1160,
  /** La cámara baja a la composición en esto: el viaje entero (después se navega, con la escena quieta). */
  camaraMs: 1500,
  /** La página nueva aparece encima de la escena (su texto, en el DOM) al destapar. */
  fundidoDeLaLlegadaMs: 420,
} as const

/**
 * La pose de partida: de frente (el ángulo de la composición), más alta y más lejos; la cámara baja de acá a la composición inicial.
 * Adentro del rango del recorrido del home (alturas de −3,6 a 9; distancias de 14 a 34).
 */
export const POSE_DE_PARTIDA: ChoreoPose = { angleDeg: 0, height: 9, distance: 27, frameX: 0, frameY: 0 }

/** Los sonidos del viaje (del sprite; con el sonido apagado no suenan: el bus no tiene motor): uno al salir y otro al llegar. */
export const SONIDOS_DEL_VIAJE = { sale: 'abre', llega: 'pulso' } as const

/** Las fases: `preparando` (la escena despierta detrás del papel, el reloj en 0), `viajando` (con su reloj) y `llegando` (navegó; reloj en 1). */
export type FaseDelViaje = 'quieto' | 'preparando' | 'viajando' | 'llegando'

const ESTADO: { fase: FaseDelViaje; inicio: number } = { fase: 'quieto', inicio: Number.NaN }
const oyentes = new Set<() => void>()
const avisar = (): void => oyentes.forEach((f) => f())

export function faseDelViaje(): FaseDelViaje {
  return ESTADO.fase
}

/** ¿Hay un viaje en curso? (La atadura dibuja la escena mientras dure.) */
export const viajeAlServicioEnCurso = (): boolean => ESTADO.fase !== 'quieto'

/** Empieza: la escena despierta, con el reloj en 0 (la cámara en la partida, de día). */
export function prepararElViaje(): void {
  ESTADO.fase = 'preparando'
  ESTADO.inicio = Number.NaN
  avisar()
}

/** Arranca el reloj (`ahora`, en el reloj de `performance.now()`): el papel sube, la cámara baja y anochece. */
export function arrancarElViaje(ahora: number): void {
  if (ESTADO.fase !== 'preparando') return
  ESTADO.fase = 'viajando'
  ESTADO.inicio = ahora
  avisar()
}

/** Navegó: la cámara y la luz ya son las de la página (el reloj, en 1). */
export function llegarConElViaje(): void {
  if (ESTADO.fase === 'quieto') return
  ESTADO.fase = 'llegando'
  avisar()
}

/** Idempotente: termina (o se cancela) el viaje. */
export function terminarElViajeAlServicio(): void {
  if (ESTADO.fase === 'quieto') return
  ESTADO.fase = 'quieto'
  ESTADO.inicio = Number.NaN
  avisar()
}

export function suscribirAlViajeAlServicio(f: () => void): () => void {
  oyentes.add(f)
  return () => {
    oyentes.delete(f)
  }
}

const acotar01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v)

/** La curva del viaje: lenta al salir y al llegar (suave de los dos lados, como la cámara del home). */
export const curvaDelViaje = (t: number): number => {
  const x = acotar01(t)
  return x * x * x * (x * (6 * x - 15) + 10)
}

/** El avance crudo del reloj (0 → 1) para `ahora`, en un tramo [desde, hasta] ms; fuera de un viaje con reloj, 0 preparando y 1 si no. */
function tramo(fase: FaseDelViaje, inicio: number, ahora: number, desde: number, hasta: number): number {
  if (fase === 'preparando') return 0
  if (fase !== 'viajando' || !Number.isFinite(inicio)) return 1
  return acotar01((ahora - inicio - desde) / Math.max(1, hasta - desde))
}

/** Cuánto bajó la cámara (0 la partida, 1 la composición), con su curva. Fuera de un viaje, 1. */
export function camaraDelViaje(ahora: number, fase: FaseDelViaje = ESTADO.fase, inicio: number = ESTADO.inicio): number {
  return curvaDelViaje(tramo(fase, inicio, ahora, 0, TIEMPOS_DEL_VIAJE.camaraMs))
}

/** Cuánta noche de la página entró (0 → 1), con su curva. Fuera de un viaje, 1 (la noche del preset entera). */
export function nocheDelViaje(ahora: number, fase: FaseDelViaje = ESTADO.fase, inicio: number = ESTADO.inicio): number {
  return curvaDelViaje(tramo(fase, inicio, ahora, TIEMPOS_DEL_VIAJE.nocheDesdeMs, TIEMPOS_DEL_VIAJE.nocheHastaMs))
}

/**
 * La pose de la página mezclada con la de partida: `k` 1 la deja como está (fuera de un viaje no toca un número); `k` 0 es la partida. El
 * encuadre (`frameX`, `frameY`) lo resuelve después el hueco, si está medido; sin hueco, también se mezcla.
 */
export function mezclarConLaPartida(objetivo: MutableChoreoPose, k: number): void {
  if (k >= 1) return
  const q = acotar01(k)
  objetivo.angleDeg = POSE_DE_PARTIDA.angleDeg + (objetivo.angleDeg - POSE_DE_PARTIDA.angleDeg) * q
  objetivo.height = POSE_DE_PARTIDA.height + (objetivo.height - POSE_DE_PARTIDA.height) * q
  objetivo.distance = POSE_DE_PARTIDA.distance + (objetivo.distance - POSE_DE_PARTIDA.distance) * q
  objetivo.frameX = POSE_DE_PARTIDA.frameX + (objetivo.frameX - POSE_DE_PARTIDA.frameX) * q
  objetivo.frameY = POSE_DE_PARTIDA.frameY + (objetivo.frameY - POSE_DE_PARTIDA.frameY) * q
}

/** El nivel de la luz con la noche de la página entrando: con `n` 1, el mínimo de siempre (exacto); con 0, el nivel del arco. */
export function nivelConLaNocheDelViaje(nivel: number, noche: number, n: number): number {
  const tope = Math.min(nivel, noche)
  return n >= 1 ? tope : nivel + (tope - nivel) * acotar01(n)
}
