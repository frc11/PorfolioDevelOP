import { MOTION_EASE, type MotionEaseName } from '@/components/design-system/motion/tokens'

/**
 * LOS TIPOS DE LA COREOGRAFÍA — el vocabulario, sin un solo número del recorrido.
 *
 * Salieron de `choreography.ts` en S6, cuando ese archivo pasó a llevar además
 * la curva de luz. La regla que los separa es la misma de siempre: **el archivo
 * que se abre para calibrar tiene que ser todo dato.** Acá vive lo que describe
 * la forma de ese dato y no cambia al mover la cámara.
 *
 * ── Lo que S6 sacó de la pose ──────────────────────────────────────────────
 *
 * `keyIntensity` y `keyKelvin` **ya no son canales de la pose.** Fueron dos
 * sliders más mientras se componían posiciones, y quedaron como valores sin
 * diseñar (intensidad 0 en el primer keyframe capturado, saltos sin razón entre
 * momentos consecutivos). La iluminación no es una propiedad de la cámara: es
 * del espacio. Ahora vive en dos lugares, los dos explícitos:
 *
 * - **El rig de tres puntos** (`probeLighting.ts`): dónde está cada luz y cuánto
 *   pesa una contra otra.
 * - **El arco** (`LIGHT_ARC`, en `choreography.ts`): cómo sube y baja el nivel
 *   general a lo largo del recorrido, como curva ligada al progreso.
 *
 * La pose quedó en **cinco canales**, que son los cinco que describen dónde está
 * la cámara y cómo cae el objeto en pantalla. Nada más.
 */

// ── La pose ─────────────────────────────────────────────────────────────────

/**
 * Los 5 canales que la coreografía maneja. `particleCount` NO entra: es una
 * perilla de medición del instrumento, no un parámetro del recorrido. La luz
 * tampoco: ver el doc de arriba.
 */
export type ChoreoPose = {
  /**
   * Azimut de la cámara, en grados. **No es un rumbo de brújula: es el ángulo
   * ACUMULADO.** Una vuelta entera se escribe como una diferencia de 360 (ver
   * `turn`), no como un módulo. El sampler lo envuelve a 0–360 solo para
   * publicarlo en el panel.
   */
  readonly angleDeg: number
  readonly height: number
  readonly distance: number
  /** Dónde cae el logo en pantalla. 0 = centrado · +1 = derecha · −1 = izquierda. */
  readonly frameX: number
  /** Ídem vertical. +1 = arriba · −1 = abajo. */
  readonly frameY: number
}

export type ChoreoChannel = keyof ChoreoPose

/** Versión escribible: el `useFrame` muestrea sobre un objeto reusado, sin asignar. */
export type MutableChoreoPose = { -readonly [K in ChoreoChannel]: number }

/**
 * Orden fijo de los canales. Se recorre por frame, así que es un array y no
 * `Object.keys` — enumerar un objeto por frame asigna un array nuevo cada vez.
 */
export const CHOREO_CHANNELS: readonly ChoreoChannel[] = [
  'angleDeg',
  'height',
  'distance',
  'frameX',
  'frameY',
]

// ── Las curvas ──────────────────────────────────────────────────────────────

/**
 * Curva con la que se LLEGA a un keyframe desde el anterior.
 *
 * Las dos con nombre son las del sistema de motion (`MOTION_EASE`), sin
 * inventar una tercera:
 *
 * - `arrive` — ease-out-quad, la curva canónica de `CLAUDE.md` para lo que
 *   ENTRA a pantalla. Reservada para las dos llegadas grandes del recorrido:
 *   el hero y el cierre.
 * - `shift` — la simétrica de Material, ya en producción como `DOCK_EASE`.
 *   Entra y sale suave, así que la pose de destino de cada sección "encastra":
 *   la cámara se asienta al llegar y arranca sin tirón al salir.
 * - `linear` — **no es una curva nueva: es no aplicar ninguna.** Va en los
 *   waypoints que viven ADENTRO de una sola gesticulación continua (los tres
 *   del giro de Demos, el apex de la persona 2). Con `shift` en cada uno, el
 *   giro se convertiría en un trinquete de cuatro frenadas. Es además la
 *   postura que el propio `tokens.ts` documenta para lo ligado a scroll: "no
 *   necesitan una curva temporal — su forma la da el mapeo del rango".
 */
export type ChoreoEase = MotionEaseName | 'linear'

/**
 * Cómo se recorre el ángulo desde el keyframe anterior.
 *
 * - `short` (default, la regla del sprint): por el camino corto — la
 *   diferencia se normaliza a (−180°, 180°].
 * - `literal`: se respeta la diferencia tal cual está escrita, valga las
 *   vueltas que valga. **Es lo que hace que el tramo de 360° dé la vuelta
 *   entera en vez de volver por donde vino.**
 *
 * Con los ángulos de hoy las dos opciones dan idéntico (ningún salto entre
 * keyframes consecutivos pasa de 180°), así que la marca no cambia un píxel
 * ahora mismo. Está para que el giro SOBREVIVA a que se editen los ángulos: el
 * día que un keyframe diga 302 y el siguiente 30 queriendo seguir para
 * adelante, `short` lo haría volver y `literal` no.
 */
export type ChoreoTurn = 'short' | 'literal'

export type ChoreoKeyframe = {
  /** Punto en el progreso 0→1. Estrictamente creciente a lo largo del array. */
  readonly at: number
  /** Nombre legible del momento. Es lo que el simulador muestra en pantalla. */
  readonly name: string
  /** `true` = derivado por Claude, no capturado por el humano. */
  readonly derived?: boolean
  /** Curva de llegada. Default `shift`. En el PRIMER keyframe se ignora. */
  readonly ease?: ChoreoEase
  /** Default `short`. */
  readonly turn?: ChoreoTurn
  readonly pose: ChoreoPose
}

export type ChoreoTramo = {
  readonly name: string
  readonly screens: number
  readonly from: number
  readonly to: number
}

/** Puntos de control de cada curva nombrada, tal cual los define el sistema. */
export const CHOREO_EASE_POINTS: Record<MotionEaseName, readonly [number, number, number, number]> =
  MOTION_EASE

// ── El arco de luz ──────────────────────────────────────────────────────────

/**
 * Un punto de la curva de luz. **No es un keyframe de cámara**: no tiene pose,
 * no se edita con el editor de keyframes y no hace falta que coincida con
 * ninguno. Es una curva propia sobre el mismo eje de progreso.
 *
 * - `level` — nivel general de la sala, 1 = luz plena. Multiplica a las tres
 *   luces del rig, al hemisférico y a la niebla, cada uno con su propia
 *   pendiente (ver `probeLighting.ts`): al bajar el nivel el ambiente se apaga
 *   más rápido que la principal y el contraluz se resiste, que es lo que hace
 *   que la escena gane contraste al oscurecerse en vez de volverse gris.
 * - `kelvin` — temperatura de color de la principal y del relleno.
 */
export type LightStop = {
  readonly at: number
  readonly level: number
  readonly kelvin: number
  /** Curva de llegada desde el stop anterior. Default `shift`. */
  readonly ease?: ChoreoEase
}

/** Lo que el arco devuelve en un progreso. Se escribe sobre un objeto reusado. */
export type MutableLightLevels = { level: number; kelvin: number }
