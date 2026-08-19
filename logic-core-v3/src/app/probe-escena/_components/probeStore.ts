import { PLAY_SPEED_DEFAULT } from './choreography'

/**
 * Store numérico del probe: el puente entre los controles del DOM y el loop de
 * r3f, SIN pasar por React.
 *
 * Por qué existe. La órbita automática mueve el ángulo en cada frame y la
 * lectura en pantalla tiene que seguirlo. Hacerlo con `useState` sería un
 * re-render por frame — prohibido por el sprint y por el `CLAUDE.md` del repo.
 * Acá los valores viven en un objeto mutable: el `useFrame` los lee (y escribe
 * el ángulo) sin tocar el árbol de React, y los suscriptores —que son todos
 * escrituras directas al DOM (`textContent`, `input.value`)— se enteran del
 * cambio.
 *
 * Es deliberadamente chiquito y sin dependencias: no es un state manager, es un
 * canal. Solo números, así que un `===` alcanza para cortar notificaciones
 * redundantes.
 */

/** Cualquier bolsa de números. La restricción hace que `set` sea exhaustivo y tipado. */
export interface NumericStore<T extends Record<string, number>> {
  /**
   * El objeto vivo. Se lee por frame; NUNCA se escribe directo desde afuera
   * (para eso está `set`, que además notifica).
   */
  readonly current: Readonly<T>
  set<K extends keyof T>(key: K, value: T[K]): void
  /**
   * Aplica varias claves y notifica UNA sola vez.
   *
   * Existe por la coreografía: el rig escribe siete canales por frame, y con
   * `set` eso serían siete rondas de notificación sobre la misma decena de
   * suscriptores — setenta llamadas por frame para publicar un solo estado. Con
   * `setMany` es una. Las claves que no cambiaron no cuentan para disparar.
   */
  setMany(patch: Readonly<Partial<T>>): void
  /** Devuelve la baja. Los listeners corren en el orden en que se suscribieron. */
  subscribe(listener: (values: Readonly<T>) => void): () => void
}

export function createNumericStore<T extends Record<string, number>>(initial: T): NumericStore<T> {
  const values: T = { ...initial }
  const listeners = new Set<(values: Readonly<T>) => void>()

  const notify = () => {
    for (const listener of listeners) listener(values)
  }

  return {
    get current(): Readonly<T> {
      return values
    },
    set(key, value) {
      // Corta el ruido: un slider que no se movió no despierta a nadie, y con la
      // órbita quieta no hay una sola escritura al DOM por frame.
      if (values[key] === value) return
      values[key] = value
      notify()
    },
    setMany(patch) {
      let changed = false

      // `for...in` y no `Object.keys`: esto corre por frame y `Object.keys`
      // asigna un array nuevo cada vez. Son siete strings, pero la disciplina de
      // este módulo es no dejarle nada al recolector desde el loop.
      for (const key in patch) {
        const typedKey = key as keyof T
        const next = patch[typedKey]
        if (next === undefined || values[typedKey] === next) continue
        values[typedKey] = next
        changed = true
      }

      if (changed) notify()
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

// ── Parámetros manipulables ─────────────────────────────────────────────────

/**
 * Los cinco controles que pide el sprint + `particleCount`.
 *
 * `particleCount` NO es una perilla estética: el reporte tiene que responder
 * "qué pasa con las partículas en cantidad", y eso se mide moviéndola con la
 * órbita corriendo y mirando el FPS. Se implementa con `setDrawRange` sobre un
 * buffer ya reservado, así que moverla no reasigna memoria.
 *
 * Es un `type` y no una `interface` a propósito: solo los alias de tipo reciben
 * el índice implícito que `Record<string, number>` exige.
 */
export type ProbeParams = {
  /** Azimut de la cámara alrededor del logo. 0° = de frente (el logo se lee bien). */
  angleDeg: number
  /** Altura de la cámara en unidades de mundo. 0 = a la altura del centro del logo. */
  height: number
  /** Distancia de la cámara al centro del logo. */
  distance: number
  /**
   * Encuadre horizontal: dónde cae el logo EN PANTALLA, independiente del
   * ángulo desde el que se lo mira. 0 = centrado · +1 = pegado a la derecha ·
   * −1 = pegado a la izquierda.
   *
   * Es lo que permite que el contenido conviva con la escena (logo a un lado,
   * texto del otro). No mueve la cámara: mueve el punto al que apunta.
   */
  frameX: number
  /** Encuadre vertical. 0 = centrado · +1 = arriba · −1 = abajo. */
  frameY: number
  /** Intensidad de la luz principal (unidades físicas de three ≥ r155: ~π× las viejas). */
  keyIntensity: number
  /** Temperatura de color de la luz principal, en kelvin. */
  keyKelvin: number
  /** Partículas dibujadas de las que hay reservadas. */
  particleCount: number
}

export type ProbeParamKey = keyof ProbeParams

export type ProbeRange = { readonly min: number; readonly max: number; readonly step: number }

/**
 * Cómo se presenta un valor: rótulo, unidad y decimales. Vive acá y no en los
 * componentes porque lo comparten el panel (que lo rotula) y la lectura
 * copiable (que lo formatea), y porque es vocabulario del parámetro, no
 * decoración de una pantalla.
 */
export type SliderSpec = {
  readonly label: string
  readonly unit: string
  readonly decimals: number
}

/**
 * Rangos de los sliders.
 *
 * `height` no baja de la altura del papel (ver `FLOOR_Y` en `probeScene.ts`):
 * la cámara puede mirar el logo desde MUY abajo —que es media hipótesis del
 * sprint— pero no meterse debajo de la hoja, donde no hay escena.
 *
 * `frameX`/`frameY` van de −1 a 1 y NO son unidades de mundo: son una fracción
 * del recorrido disponible, que el rig calcula por frame contra la caja medida
 * del logo y el alto visible a la distancia actual. Por eso ±1 significa
 * "pegado al costado" en cualquier distancia y en cualquier relación de
 * aspecto, en vez de un desplazamiento fijo que a 6 unidades tira el logo
 * afuera y a 30 no lo mueve.
 */
export const PROBE_RANGES: { readonly [K in ProbeParamKey]: ProbeRange } = {
  angleDeg: { min: 0, max: 360, step: 0.5 },
  height: { min: -3.9, max: 9, step: 0.05 },
  distance: { min: 6, max: 30, step: 0.1 },
  frameX: { min: -1, max: 1, step: 0.01 },
  frameY: { min: -1, max: 1, step: 0.01 },
  keyIntensity: { min: 0, max: 9, step: 0.05 },
  keyKelvin: { min: 2000, max: 10000, step: 50 },
  particleCount: { min: 0, max: 4000, step: 50 },
}

/** Orden fijo, en pantalla y en el texto que se copia. */
export const PROBE_PARAM_ORDER: readonly ProbeParamKey[] = [
  'angleDeg',
  'height',
  'distance',
  'frameX',
  'frameY',
  'keyIntensity',
  'keyKelvin',
  'particleCount',
]

export const PROBE_PARAM_SPECS: { readonly [K in ProbeParamKey]: SliderSpec } = {
  angleDeg: { label: 'ángulo de la órbita', unit: '°', decimals: 1 },
  height: { label: 'altura de la cámara', unit: '', decimals: 2 },
  distance: { label: 'distancia al logo', unit: '', decimals: 1 },
  frameX: { label: 'encuadre horizontal', unit: '', decimals: 2 },
  frameY: { label: 'encuadre vertical', unit: '', decimals: 2 },
  keyIntensity: { label: 'intensidad de la luz', unit: '', decimals: 2 },
  keyKelvin: { label: 'temperatura de la luz', unit: ' K', decimals: 0 },
  particleCount: { label: 'partículas dibujadas', unit: '', decimals: 0 },
}

export const PROBE_DEFAULTS: ProbeParams = {
  angleDeg: 0,
  height: 1.6,
  distance: 12.5,
  // Los dos en 0: con el encuadre centrado la escena renderiza EXACTAMENTE
  // como la que se midió en el reporte, así que los números de peso y de FPS
  // siguen valiendo.
  frameX: 0,
  frameY: 0,
  keyIntensity: 3.4,
  // 6500 K = D65, el blanco neutro. Con 5600 (luz de dia "calida") el papel
  // renderizaba rosado y el default del instrumento tenia un sesgo de color
  // que no era una decision, era un descuido — medido en captura.
  keyKelvin: 6500,
  particleCount: 900,
}

// ── Medición (no se manipula: se lee) ───────────────────────────────────────

/**
 * Lo que la escena MIDE y publica al DOM. Separado de los parámetros porque no
 * es entrada del humano, es salida del instrumento.
 *
 * Las tres dimensiones del logo se publican porque son la evidencia del sprint:
 * la pregunta de fondo ("es una lámina") se contesta con el número real del
 * espesor contra el ancho, no con una impresión.
 */
export type ProbeStats = {
  fps: number
  /** Caja real del logo extruido, en unidades de mundo (ancho × alto × espesor). */
  logoW: number
  logoH: number
  logoD: number
}

export const PROBE_STATS_DEFAULTS: ProbeStats = { fps: 0, logoW: 0, logoH: 0, logoD: 0 }

// ── El rig de coreografía ───────────────────────────────────────────────────

/**
 * Los dos modos del instrumento.
 *
 * - `coreografia` — el progreso 0→1 maneja la cámara a través del track. Los
 *   siete sliders de parámetro pasan a ser TELEMETRÍA: siguen mostrando el
 *   valor exacto de cada frame y la línea copiable sigue funcionando, así que
 *   scrubear y copiar una pose es el flujo de calibración.
 * - `manual` — el probe de siempre, idéntico: los sliders mandan, sin inercia,
 *   sin mouse y sin vira. Es lo que permite seguir componiendo posiciones
 *   nuevas con precisión, y lo que hace que las mediciones ya publicadas sigan
 *   valiendo.
 */
export type ProbeMode = 'coreografia' | 'manual'

/**
 * Estado numérico del rig. Va en un store aparte del de parámetros a propósito:
 * el progreso NO es un parámetro de la escena, y meterlo en `ProbeParams`
 * ensuciaría la línea copiable con un número que no describe una pose.
 *
 * `tramoIndex` y `keyframeIndex` son ÍNDICES y no nombres porque el store solo
 * transporta números; el panel los traduce contra el mismo array de datos. Es
 * lo que permite que la lectura del tramo actual salga del `useFrame` sin
 * inventar un segundo canal ni un `setState`.
 */
export type ProbeRig = {
  /** Progreso de la coreografía, 0→1. */
  progress: number
  /** Progreso por segundo del botón de reproducción. */
  playSpeed: number
  /** Multiplicador global de la inercia. 0 = sin inercia (directo al objetivo). */
  settleScale: number
  /** Multiplicador de la magnitud del offset de mouse. 0 = sin mouse. */
  mouseScale: number
  /** Índice en `CHOREO_TRAMOS`. Lo escribe el rig, lo lee el panel. */
  tramoIndex: number
  /** Índice en `CHOREO_KEYFRAMES` del keyframe más cercano. */
  keyframeIndex: number
}

export type ProbeRigKey = keyof ProbeRig

/**
 * Solo los cuatro que tienen slider. `tramoIndex`/`keyframeIndex` son salida
 * del instrumento, no entrada.
 */
export type ProbeRigSliderKey = 'progress' | 'playSpeed' | 'settleScale' | 'mouseScale'

export const PROBE_RIG_RANGES: { readonly [K in ProbeRigSliderKey]: ProbeRange } = {
  progress: { min: 0, max: 1, step: 0.001 },
  playSpeed: { min: 0.01, max: 0.5, step: 0.005 },
  // Hasta 3× para poder exagerar la inercia y VERLA mientras se calibra: en 1
  // el asentamiento es correcto pero sutil, y un parámetro que no se percibe no
  // se puede ajustar.
  settleScale: { min: 0, max: 3, step: 0.05 },
  mouseScale: { min: 0, max: 3, step: 0.05 },
}

export const PROBE_RIG_SPECS: { readonly [K in ProbeRigSliderKey]: SliderSpec } = {
  progress: { label: 'progreso del recorrido', unit: '', decimals: 3 },
  playSpeed: { label: 'velocidad', unit: ' /s', decimals: 3 },
  settleScale: { label: 'inercia', unit: '×', decimals: 2 },
  mouseScale: { label: 'mouse', unit: '×', decimals: 2 },
}

export const PROBE_RIG_DEFAULTS: ProbeRig = {
  progress: 0,
  playSpeed: PLAY_SPEED_DEFAULT,
  settleScale: 1,
  mouseScale: 1,
  tramoIndex: 0,
  keyframeIndex: 0,
}

export type ProbeParamsStore = NumericStore<ProbeParams>
export type ProbeStatsStore = NumericStore<ProbeStats>
export type ProbeRigStore = NumericStore<ProbeRig>
