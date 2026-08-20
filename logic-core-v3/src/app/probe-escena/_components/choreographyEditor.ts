import { CHOREO_KEYFRAMES } from './choreography'
import { buildTrack, type ChoreoTrack } from './choreographySampler'
import {
  CHOREO_CHANNELS,
  type ChoreoChannel,
  type ChoreoEase,
  type ChoreoTurn,
  type MutableChoreoPose,
} from './choreographyTypes'

/**
 * EL TRACK EDITABLE — la coreografía viva, en memoria.
 *
 * ── Qué resuelve ───────────────────────────────────────────────────────────
 *
 * Hasta S4 el track se construía una vez con los datos del archivo y no había
 * forma de ajustar un keyframe sin editar `choreography.ts` a mano, recargar y
 * volver a mirar. Este módulo mete una copia mutable en el medio: el editor
 * escribe sobre ella, el `useFrame` la lee, y el humano exporta el resultado
 * cuando le cierra.
 *
 * **Las ediciones NO tocan el disco.** El archivo sigue siendo la fuente de
 * verdad; lo que hay acá es una sesión de trabajo que se pierde al recargar, a
 * propósito. El camino de vuelta es el export (ver `choreographyExport.ts`).
 *
 * ── ⚠️ EXPORTAR NO ES GUARDAR ──────────────────────────────────────────────
 *
 * **Ya costó una sesión de calibración entera y conviene tenerlo escrito.**
 *
 * El botón de exportar copia el bloque al portapapeles. Eso es todo lo que hace.
 * La calibración solo existe cuando ese texto se **pega en `choreography.ts`**;
 * hasta entonces vive en el portapapeles del sistema —que la siguiente copia
 * pisa— y en este módulo, que muere al recargar la página.
 *
 * En S6 pasó exactamente eso: veinticuatro keyframes calibrados mirando la
 * escena, grabados en video, exportados... y nunca pegados. El archivo siguió
 * mostrando la versión anterior durante todo un sprint, y el trabajo se
 * recuperó de casualidad.
 *
 * El rodeo del portapapeles es deliberado —lo que se queda tiene que ser un acto
 * explícito del humano— pero eso significa que **el paso que guarda es el
 * pegado, no el click.** El panel lo dice en voz alta por la misma razón.
 *
 * ── Las tres invariantes ───────────────────────────────────────────────────
 *
 * 1. **`at` estrictamente creciente.** `buildTrack` lo exige y con razón: un
 *    segmento de duración cero es una división por cero en el muestreo. Se
 *    garantiza acotando cada `at` entre sus vecinos, así el array NUNCA se
 *    reordena y la lista de la pantalla no salta mientras se arrastra.
 * 2. **Solo se borra lo que el editor creó.** Un keyframe del archivo no se
 *    puede perder por accidente; el `reset` es el único camino de vuelta y es
 *    explícito.
 * 3. **El track se reconstruye por evento, no por frame.** Cada mutación lo
 *    invalida y el siguiente acceso lo rearma. Con el humano arrastrando un
 *    slider eso es una reconstrucción por evento de input — diecisiete restas.
 *
 * ── Por qué el track es perezoso ───────────────────────────────────────────
 *
 * `buildTrack` TIRA si los datos están mal ordenados, y ese error tiene que
 * caer adentro del `StageErrorBoundary` que envuelve al canvas — no en el
 * render del panel, que es lo único que quedaría para entender qué pasó. Por
 * eso el constructor no lo llama: lo llama el primer acceso a `.track`, que
 * ocurre dentro del `useFrame`. El panel solo mira `.keyframes`, que no valida.
 */

/** De dónde salió el keyframe. Los del archivo no se pueden borrar. */
export type KeyframeOrigin = 'archivo' | 'editor'

export type EditableKeyframe = {
  /** Identidad estable. La selección apunta acá y no a un índice. */
  readonly id: number
  at: number
  name: string
  /** `true` = derivado por Claude en S4, no capturado por el humano. */
  readonly derived: boolean
  ease?: ChoreoEase
  turn?: ChoreoTurn
  readonly pose: MutableChoreoPose
  readonly origin: KeyframeOrigin
  /** `true` = se le movió algo en esta sesión. Es la marca "esto lo tocaste". */
  edited: boolean
}

/**
 * Separación mínima entre dos `at`, y el paso del slider de progreso. Todos los
 * `at` se redondean a esta resolución: sin eso, arrastrar deja colas de coma
 * flotante (0,30000000000000004) que después ensucian el archivo exportado.
 */
export const AT_STEP = 0.001

function round3(value: number): number {
  return Math.round(value * 1000) / 1000
}

/** Lo mínimo que hace falta para copiar un keyframe, venga del archivo o de otro. */
type KeyframeSeed = {
  readonly at: number
  readonly name: string
  readonly derived?: boolean
  readonly ease?: ChoreoEase
  readonly turn?: ChoreoTurn
  readonly pose: Readonly<Record<ChoreoChannel, number>>
}

function clone(seed: KeyframeSeed, id: number, origin: KeyframeOrigin): EditableKeyframe {
  // La pose se copia canal por canal y no con un spread: el destino tiene que
  // ser un objeto propio y mutable, no una vista del literal `readonly` del
  // archivo.
  const pose = {} as MutableChoreoPose
  for (const channel of CHOREO_CHANNELS) pose[channel] = seed.pose[channel]

  return {
    id,
    at: seed.at,
    name: seed.name,
    derived: seed.derived === true,
    ease: seed.ease,
    turn: seed.turn,
    pose,
    origin,
    edited: false,
  }
}

export type ChoreoEditor = {
  /** El array vivo, en orden. Se lee; se muta por los métodos. */
  readonly keyframes: readonly EditableKeyframe[]
  /** El track muestreable. Se rearma solo, después de cada mutación. */
  readonly track: ChoreoTrack
  /** Sube con cada cambio que la pantalla tenga que reflejar. */
  readonly version: number
  /** `true` = hay algo distinto del archivo. Es lo que habilita el reset. */
  readonly dirty: boolean
  subscribe(listener: () => void): () => void
  find(id: number): EditableKeyframe | undefined
  indexOf(id: number): number
  /** Mueve el punto del recorrido. Devuelve el `at` EFECTIVO, ya acotado. */
  setAt(id: number, at: number): number
  /** Escribe los siete canales de una. Ignora lo que no cambió. */
  applyPose(id: number, values: Readonly<Record<ChoreoChannel, number>>): void
  /** Copia con la misma pose y un `at` nuevo. `null` = no había lugar. */
  duplicate(id: number): EditableKeyframe | null
  /** Solo los que creó el editor. `false` = no se borró. */
  remove(id: number): boolean
  /** Vuelve a los valores del archivo. Descarta toda la sesión. */
  reset(): void
}

export function createChoreoEditor(): ChoreoEditor {
  let nextId = 0
  let keyframes: EditableKeyframe[] = []
  let track: ChoreoTrack | null = null
  let version = 0
  let dirty = false

  const listeners = new Set<() => void>()

  const load = () => {
    nextId = 0
    keyframes = CHOREO_KEYFRAMES.map((keyframe) => clone(keyframe, nextId++, 'archivo'))
    track = null
    dirty = false
  }

  /** Invalida el track y despierta a la pantalla. Solo para cambios VISIBLES. */
  const publish = () => {
    track = null
    version += 1
    for (const listener of listeners) listener()
  }

  const indexOf = (id: number) => keyframes.findIndex((keyframe) => keyframe.id === id)

  load()

  return {
    get keyframes() {
      return keyframes
    },
    get track() {
      if (!track) track = buildTrack(keyframes)
      return track
    },
    get version() {
      return version
    },
    get dirty() {
      return dirty
    },

    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },

    find(id) {
      return keyframes.find((keyframe) => keyframe.id === id)
    },

    indexOf,

    setAt(id, at) {
      const index = indexOf(id)
      if (index < 0) return at

      const keyframe = keyframes[index]
      const previous = keyframes[index - 1]
      const next = keyframes[index + 1]

      // Acotado entre los vecinos: el array nunca se reordena, así que la lista
      // no salta mientras se arrastra y `buildTrack` no puede tirar. Para pasar
      // un keyframe por encima de otro hay que mover primero al otro — está
      // dicho en la ayuda del panel.
      const low = previous ? round3(previous.at + AT_STEP) : 0
      const high = next ? round3(next.at - AT_STEP) : 1
      if (low > high) return keyframe.at

      const value = Math.min(Math.max(round3(at), low), high)
      if (value === keyframe.at) return value

      keyframe.at = value
      keyframe.edited = true
      dirty = true
      publish()
      return value
    },

    applyPose(id, values) {
      const keyframe = keyframes.find((candidate) => candidate.id === id)
      if (!keyframe) return

      let changed = false
      for (const channel of CHOREO_CHANNELS) {
        const value = values[channel]
        if (keyframe.pose[channel] === value) continue
        keyframe.pose[channel] = value
        changed = true
      }

      if (!changed) return

      dirty = true

      // La pose NO se dibuja en la lista, así que arrastrar un slider de escena
      // no re-renderiza React: lo único visible es la marca "editado", y esa
      // cambia una sola vez. El track sí se invalida en cada cambio.
      if (keyframe.edited) {
        track = null
        return
      }

      keyframe.edited = true
      publish()
    },

    duplicate(id) {
      const index = indexOf(id)
      if (index < 0) return null

      const source = keyframes[index]
      const previous = keyframes[index - 1]
      const next = keyframes[index + 1]

      // A mitad de camino hacia el SIGUIENTE: es el patrón de sostén — se llega
      // en el original y se sostiene hasta la copia. En el último keyframe no
      // hay siguiente, así que la copia va hacia atrás y el sostén queda ANTES:
      // se llega temprano y se aguanta hasta el final.
      const at = next
        ? round3((source.at + next.at) / 2)
        : previous
          ? round3((previous.at + source.at) / 2)
          : source.at

      // Sin lugar entre los vecinos no se inventa uno: se avisa y el humano
      // separa los `at` primero.
      if (at === source.at || at === previous?.at || at === next?.at) return null

      const copy = clone(
        {
          at,
          name: `${source.name} · sostén`,
          ease: source.ease,
          turn: source.turn,
          pose: source.pose,
        },
        nextId++,
        'editor'
      )

      keyframes.splice(next ? index + 1 : index, 0, copy)
      dirty = true
      publish()
      return copy
    },

    remove(id) {
      const index = indexOf(id)
      if (index < 0) return false
      // Un keyframe del archivo no se pierde por un click. Y el track necesita
      // dos para existir.
      if (keyframes[index].origin !== 'editor' || keyframes.length <= 2) return false

      keyframes.splice(index, 1)
      dirty = true
      publish()
      return true
    },

    reset() {
      load()
      publish()
    },
  }
}
