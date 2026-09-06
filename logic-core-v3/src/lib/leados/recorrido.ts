/**
 * LeadOS P20 — EL RECORRIDO DEL LEAD: los nueve pasos, y en cuál está.
 *
 * El manual mostraba el pasado (la tira de completadas) y nunca el futuro. Este
 * módulo deriva la otra mitad: la lista entera de pasos, en orden, con el estado
 * de cada uno. De ahí sale la franja que las catorce pantallas muestran.
 *
 * ── Por qué la FASE y no la pantalla, el stage ni el bloque ──────────────────
 * Cuatro granularidades conviven en el repo y sólo una es la que el setter
 * nombraría como «los pasos»:
 *
 *   · las FASES del manual (`FASES_MANUAL`) — Ficha, Opener, Seguimiento,
 *     Brief, Construcción, Borrador, Chequeo final, Envío, Agenda. Es el
 *     vocabulario con el que el setter habla de su trabajo, y el único nivel
 *     donde «Construir» y «Refinar» vuelven a ser UNA cosa: construir la demo.
 *     P6-B las agrupó en dos pantallas por comodidad de presentación y dejó
 *     dicho que la unidad persistida seguía siendo otra.
 *   · las PANTALLAS (`PANTALLA_IDS`, catorce) — presentación. `mc1`/`mc2` son
 *     dos pantallas de un solo paso; `espera`/`revision`/`archivo` no son pasos
 *     de nadie: son la ausencia de paso.
 *   · los STAGES del dossier — la máquina de estados. Son del sistema, y el
 *     propio producto los muestra como badge, no como recorrido.
 *   · los BLOQUES de la ficha (P16) — el adentro de UN paso, no el recorrido.
 *
 * ── De dónde sale cada cosa (nada acá es un dato nuevo) ──────────────────────
 * El ORDEN se proyecta de `ORDEN_MANUAL` (la lista canónica del manual), no se
 * escribe a mano: una fase nueva, o un reordenamiento, entra sola. Los NOMBRES
 * salen de `FASES_MANUAL`. Y el ESTADO de cada paso sale entero de
 * `PosicionManual` —la derivación que P19 dejó consistente— sin re-derivar
 * nada: `actual` marca el paso de ahora, `completadas` marca lo hecho y
 * `completadas ∪ habilitadas` es el MISMO criterio de alcance que usan la
 * guardia de la página y `EnlacePantalla`.
 *
 * Imports relativos y sin `@/` (patrón de `flow.ts`/`manual.ts`): así el
 * invariante lo carga sin tsconfig-paths y sin DB.
 */
import {
  FASES_MANUAL,
  ORDEN_MANUAL,
  PANTALLAS,
  type FaseManualId,
  type PantallaId,
  type PosicionManual,
} from './manual.ts'

/**
 * Las fases en el orden del manual, PROYECTADAS de `ORDEN_MANUAL`.
 *
 * No es una lista nueva: es la canónica leída por fase y deduplicada (las dos
 * pantallas de Construcción colapsan en su fase). Escribirla a mano habría
 * creado la segunda lista que se desincroniza en silencio — el defecto que
 * `PANTALLA_DE_FASE` ya tuvo que cerrar con una tabla explícita.
 */
export const FASES_EN_ORDEN: readonly FaseManualId[] = (() => {
  const vistas = new Set<FaseManualId>()
  const orden: FaseManualId[] = []
  for (const id of ORDEN_MANUAL) {
    const fase = PANTALLAS[id].fase
    if (fase === null || vistas.has(fase)) continue
    vistas.add(fase)
    orden.push(fase)
  }
  return orden
})()

/**
 * El estado de un paso del recorrido.
 *
 *   `actual`      — donde está el lead. Uno como mucho: sale de
 *                   `PANTALLAS[posicion.actual].fase`, y las pantallas de
 *                   estado (espera/revisión/archivo) no tienen fase → en ellas
 *                   NINGÚN paso es el actual, que es la verdad: ahí no hay paso.
 *   `completado`  — todas las pantallas de la fase quedaron hechas.
 *   `alcanzable`  — se puede entrar, pero no es ni lo hecho ni el paso de ahora.
 *   `futuro`      — el motor no lo habilita. No se navega (ver `destino`).
 */
export type EstadoPaso = 'actual' | 'completado' | 'alcanzable' | 'futuro'

export type PasoRecorrido = {
  fase: FaseManualId
  /** El nombre con el que el setter lo llama (`FASES_MANUAL`). */
  titulo: string
  /** 1..N — la posición en el recorrido, para leerlo sin los nombres. */
  orden: number
  estado: EstadoPaso
  /**
   * A qué pantalla lleva el paso, o `null` si el motor no deja entrar. `null`
   * es la instrucción de NO pintar un enlace: un salto a una pantalla no
   * habilitada rebota contra el `redirect` de la guardia de la página, que es
   * el callejón con un paso más que este repo ya cerró en `EnlacePantalla`.
   */
  destino: PantallaId | null
  /** La pantalla que se está mirando pertenece a esta fase (`aria-current`). */
  viendo: boolean
}

/** ¿Todas las pantallas de la fase están completadas? */
function faseCompleta(fase: FaseManualId, posicion: PosicionManual): boolean {
  const pantallas = FASES_MANUAL[fase].pantallas
  return (
    pantallas.length > 0 && pantallas.every((id) => posicion.completadas.includes(id))
  )
}

/**
 * La pantalla a la que lleva la fase, con el MISMO criterio de alcance que la
 * guardia de la página (`completadas ∪ habilitadas`). Si el lead está parado en
 * una pantalla de esta fase, el destino es ésa; si no, la primera de la fase que
 * se pueda abrir. Ninguna alcanzable → `null`.
 */
function destinoDeFase(
  fase: FaseManualId,
  posicion: PosicionManual,
): PantallaId | null {
  const pantallas = FASES_MANUAL[fase].pantallas
  const alcanzable = (id: PantallaId) =>
    posicion.completadas.includes(id) || posicion.habilitadas.includes(id)
  if (pantallas.includes(posicion.actual) && alcanzable(posicion.actual)) {
    return posicion.actual
  }
  return pantallas.find(alcanzable) ?? null
}

/**
 * El recorrido completo: lo hecho, dónde está el lead y lo que falta.
 *
 * Puro y sin reloj: misma posición, mismo recorrido. `viendoPantalla` es la
 * pantalla que se está renderizando — distinta de `posicion.actual` cuando el
 * setter entró a una completada, y por eso son dos marcas y no una: el cyan
 * dice dónde está el lead, `viendo` dice dónde está el ojo.
 */
export function derivarRecorrido(
  posicion: PosicionManual,
  viendoPantalla: PantallaId,
): PasoRecorrido[] {
  const faseActual = PANTALLAS[posicion.actual].fase
  const faseVista = PANTALLAS[viendoPantalla].fase
  return FASES_EN_ORDEN.map((fase, i) => {
    const destino = destinoDeFase(fase, posicion)
    // La precedencia importa: una fase puede estar completada Y ser el paso de
    // ahora (m5 es repetible; el re-loop reabre una Construcción ya tildada).
    // Gana `actual` — es lo que el setter necesita ver, y es el dato de P19.
    const estado: EstadoPaso =
      fase === faseActual
        ? 'actual'
        : faseCompleta(fase, posicion)
          ? 'completado'
          : destino !== null
            ? 'alcanzable'
            : 'futuro'
    return {
      fase,
      titulo: FASES_MANUAL[fase].titulo,
      orden: i + 1,
      estado,
      destino,
      viendo: fase === faseVista,
    }
  })
}
