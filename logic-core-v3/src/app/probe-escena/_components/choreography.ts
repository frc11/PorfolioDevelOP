import { MOTION_EASE, type MotionEaseName } from '@/components/design-system/motion/tokens'

/**
 * LA COREOGRAFÍA — datos, no lógica.
 *
 * Este archivo es el que se abre para calibrar el movimiento. Todo lo que
 * define el recorrido y su física vive acá: los keyframes, los tramos y los
 * parámetros de inercia, mouse y vira. La matemática que los consume está en
 * `choreographySampler.ts` y no hay que tocarla para mover la cámara.
 *
 * ── Las 8 pantallas ────────────────────────────────────────────────────────
 *
 * El progreso 0→1 cubre 8 pantallas de scroll repartidas en seis tramos, así
 * que cada pantalla vale 0,125 exacto y los bordes de tramo caen en múltiplos
 * de esa fracción (ver `CHOREO_TRAMOS`).
 *
 * ── De dónde salen los números ─────────────────────────────────────────────
 *
 * 15 de los 17 keyframes son **posiciones capturadas por el humano** componiendo
 * cada momento en pantalla con el probe. No se les tocó un decimal: no son una
 * propuesta a mejorar, son el dato. Los 2 restantes están marcados
 * `derived: true` y existen porque la descripción del recorrido pide
 * sub-movimientos SECUENCIALES ("en ese orden", "y luego") que dos posiciones
 * no pueden expresar. Cada uno explica en su comentario qué inventó y qué
 * habría que mirar para corregirlo.
 *
 * ── Lo que se calibra primero ──────────────────────────────────────────────
 *
 * 1. **La pose de cada tramo cae en su BORDE, no se sostiene.** Con este
 *    reparto el hero queda perfectamente encuadrado en el instante en que se
 *    lo deja de ver. Se arregla duplicando el keyframe con otro `at` (uno para
 *    llegar, otro para sostener) — es una edición de datos, sin lógica. Se
 *    calibra mirando, no calculando, y por eso no se hizo acá.
 * 2. **El keyframe 1 es lo que se ve al aterrizar**: altura 9,00, casi desde
 *    arriba, y el descenso al hero se come la primera pantalla entera.
 * 3. **El giro de Demos son 262° en una sola pantalla.** Si se siente
 *    latigazo, la salida es repartirlo hacia Portfolio y Movimiento final:
 *    ediciones de la columna `at`, nada más.
 */

// ── Tipos ───────────────────────────────────────────────────────────────────

/**
 * Los 7 canales que la coreografía maneja. `particleCount` NO entra: es una
 * perilla de medición del instrumento, no un parámetro del recorrido.
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
  readonly keyIntensity: number
  readonly keyKelvin: number
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
  'keyIntensity',
  'keyKelvin',
]

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
 *   del giro de Demos, los dos derivados). Con `shift` en cada uno, el giro se
 *   convertiría en un trinquete de cuatro frenadas. Es además la postura que
 *   el propio `tokens.ts` documenta para lo ligado a scroll: "no necesitan una
 *   curva temporal — su forma la da el mapeo del rango".
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

// ── Los tramos ──────────────────────────────────────────────────────────────

/** Pantallas de scroll que cubre el recorrido completo. */
export const CHOREO_SCREENS = 8

/**
 * Los seis tramos. `from`/`to` son múltiplos exactos de 1/8 y cubren [0, 1] sin
 * huecos ni solapes — el sampler se apoya en eso para la lectura del tramo
 * actual.
 */
export const CHOREO_TRAMOS: readonly ChoreoTramo[] = [
  { name: 'hero', screens: 1, from: 0, to: 0.125 },
  { name: 'quiénes somos', screens: 2, from: 0.125, to: 0.375 },
  { name: 'números', screens: 1, from: 0.375, to: 0.5 },
  { name: 'portfolio', screens: 1, from: 0.5, to: 0.625 },
  { name: 'demos', screens: 1, from: 0.625, to: 0.75 },
  { name: 'movimiento final + cierre', screens: 2, from: 0.75, to: 1 },
]

// ── Los keyframes ───────────────────────────────────────────────────────────

/** Iluminación de casi todo el recorrido. Solo el cierre se aparta. */
const LIT = { keyIntensity: 3.4, keyKelvin: 6500 } as const

/**
 * El recorrido. 17 keyframes: 15 capturados + 2 derivados.
 *
 * **La iluminación arranca clara y termina apagándose** (3,40 → 0,20 y
 * 6500 K → 7850 K, todo en la última pantalla). Ese apagado es parte de la
 * coreografía, no un detalle: es el cierre.
 */
export const CHOREO_KEYFRAMES: readonly ChoreoKeyframe[] = [
  // ── Tramo 1 · Hero ────────────────────────────────────────────────────────
  // "la cámara mira alto y baja hasta encuadrar el hero"
  {
    at: 0,
    name: 'entrada · mirada alta',
    // Sin `ease`: es el primer keyframe, no se llega a él desde ningún lado.
    pose: { angleDeg: 0, height: 9, distance: 16.2, frameX: 0.85, frameY: 0.02, ...LIT },
  },
  {
    at: 0.125,
    name: 'hero',
    // `arrive` — la curva del sistema para lo que ENTRA. El descenso desde 9,00
    // aterriza en el encuadre del hero, no lo cruza.
    ease: 'arrive',
    pose: { angleDeg: 0, height: -0.2, distance: 16.2, frameX: 0.85, frameY: 0.02, ...LIT },
  },

  // ── Tramo 2 · Quiénes somos (dos personas) ───────────────────────────────
  {
    // "baja el encuadre horizontal, sube el vertical y se acerca al logo, TODO
    // AL MISMO TIEMPO" — una sola transición, sin intermedios.
    at: 0.25,
    name: 'quiénes somos · persona 1',
    ease: 'shift',
    pose: { angleDeg: 0, height: 3.5, distance: 10.5, frameX: -0.5, frameY: -0.11, ...LIT },
  },
  {
    // ═══ DERIVADO ═══
    //
    // "sube el vertical, sube el horizontal, y LUEGO vuelve a bajar el
    // vertical". Ese "luego" pide un intermedio que las capturas no tienen.
    //
    // Ambigüedad real, resuelta a la vista: "el vertical" puede ser la ALTURA
    // de cámara o el ENCUADRE vertical, y las dos capturas dicen cosas
    // distintas — `frameY` vuelve exacto a −0,11 (la firma de "vuelve a
    // bajar"), pero la altura sube neto 3,50 → 4,25. Así que **suben y bajan
    // las dos**: es una sola gesticulación coherente (la cámara se levanta y
    // barre el logo en arco de izquierda a derecha, y después se asienta) y
    // satisface las dos lecturas.
    //
    // Para quedarse con una sola lectura: bajar `height` a 4.25 mata la
    // excursión de altura; subir `frameY` a −0.11 mata la del encuadre. Un
    // número cada una.
    //
    // `frameX` ya llega acá a su valor final (0,77): "sube el horizontal" pasa
    // JUNTO con la subida, y lo único que queda después es el asentamiento.
    at: 0.335,
    name: 'persona 2 · cruce (apex)',
    derived: true,
    ease: 'linear',
    pose: { angleDeg: 0, height: 4.9, distance: 10.6, frameX: 0.77, frameY: 0.38, ...LIT },
  },
  {
    at: 0.375,
    name: 'quiénes somos · persona 2',
    ease: 'shift',
    pose: { angleDeg: 0, height: 4.25, distance: 10.7, frameX: 0.77, frameY: -0.11, ...LIT },
  },

  // ── Tramo 3 · Números ────────────────────────────────────────────────────
  {
    // ═══ DERIVADO ═══
    //
    // "reduce altura, aumenta distancia (EN ESE ORDEN, SECUENCIAL)". Secuencial
    // = un keyframe en el medio: la altura ya abajo en el −0,30 que se capturó,
    // con la distancia todavía en el 10,7 que traía.
    //
    // El encuadre "se reacomoda a cero" a mitad de camino acá y termina en el
    // keyframe siguiente. Nada de esto está capturado: los dos valores de
    // encuadre son interpolación explícita.
    at: 0.415,
    name: 'números · baja la altura',
    derived: true,
    ease: 'linear',
    pose: { angleDeg: 0, height: -0.3, distance: 10.7, frameX: 0.42, frameY: -0.05, ...LIT },
  },
  {
    at: 0.45,
    name: 'números · se aleja',
    ease: 'shift',
    pose: { angleDeg: 0, height: -0.3, distance: 22.3, frameX: 0.01, frameY: 0.01, ...LIT },
  },
  {
    // "y luego vuelve a subir altura y a acercarse" — las dos juntas.
    at: 0.5,
    name: 'números',
    ease: 'shift',
    pose: { angleDeg: 0, height: 5.1, distance: 15.2, frameX: 0.01, frameY: 0.01, ...LIT },
  },

  // ── Tramo 4 · Portfolio ──────────────────────────────────────────────────
  {
    // "se acerca, rota hacia la derecha y sube la altura — un ACERCAMIENTO
    // DIAGONAL": las tres a la vez, una sola transición sobre toda la pantalla.
    // `frameX` −1,00 deja el logo pegado a la izquierda para que el contenido
    // ocupe arriba a la derecha.
    at: 0.625,
    name: 'portfolio',
    ease: 'shift',
    pose: { angleDeg: 39.5, height: 5.65, distance: 6.3, frameX: -1, frameY: 0.1, ...LIT },
  },

  // ── Tramo 5 · Demos ──────────────────────────────────────────────────────
  //
  // "rota 360° MIENTRAS baja la altura, y termina con la cámara mirando el logo
  // desde abajo a la izquierda hacia arriba a la derecha".
  //
  // Los tres waypoints intermedios son capturados, y su `at` está repartido
  // PROPORCIONAL AL ÁNGULO recorrido (74° / 31° / 83,5° / 74° sobre 262,5°
  // totales) para que el giro sea de velocidad pareja y no lurchee.
  //
  // Los cuatro van `turn: 'literal'`: es la marca explícita de "acá se da la
  // vuelta entera, no se vuelve por donde se vino".
  {
    at: 0.66,
    name: 'demos · giro ¼',
    ease: 'linear',
    turn: 'literal',
    pose: { angleDeg: 113.5, height: 4.25, distance: 6.3, frameX: -1, frameY: 0.1, ...LIT },
  },
  {
    at: 0.675,
    name: 'demos · giro ½',
    ease: 'linear',
    turn: 'literal',
    pose: { angleDeg: 144.5, height: -1.9, distance: 6.3, frameX: -1, frameY: 0.1, ...LIT },
  },
  {
    at: 0.715,
    name: 'demos · giro ¾',
    ease: 'linear',
    turn: 'literal',
    pose: { angleDeg: 228, height: -3.5, distance: 6.3, frameX: -1, frameY: 0.1, ...LIT },
  },
  {
    // La cámara termina ABAJO (altura −2,70) y el logo salta a la derecha
    // (`frameX` +1,00) para dejarle abajo a la izquierda a las demos.
    at: 0.75,
    name: 'demos',
    ease: 'shift',
    turn: 'literal',
    pose: { angleDeg: 302, height: -2.7, distance: 7.7, frameX: 1, frameY: 0.1, ...LIT },
  },

  // ── Tramo 6 · Movimiento final + cierre ──────────────────────────────────
  //
  // "se levanta, gira un poco, baja, y se aleja": cuatro beats, y hay cuatro
  // transiciones capturadas. Nada derivado acá. Cada uno va `shift` para que se
  // lean como beats y no como un barrido continuo.
  {
    at: 0.792,
    name: 'final · se levanta',
    ease: 'shift',
    pose: { angleDeg: 312, height: 3.55, distance: 7.7, frameX: 1, frameY: 0.14, ...LIT },
  },
  {
    at: 0.833,
    name: 'final · gira',
    ease: 'shift',
    pose: { angleDeg: 347, height: 3.55, distance: 7.7, frameX: -0.02, frameY: 0, ...LIT },
  },
  {
    at: 0.875,
    name: 'final · baja',
    ease: 'shift',
    pose: { angleDeg: 360, height: -2.05, distance: 7.7, frameX: -0.02, frameY: 0, ...LIT },
  },
  {
    // "se aleja del todo y queda el logo" — centrado, con la sala apagándose.
    // `arrive` para que la luz muera rápido y después se demore, en vez de
    // desvanecerse plano.
    //
    // El track TERMINA ACÁ. La cola que describe el recorrido ("después las
    // letras se van, la cámara se mueve a otros ángulos y termina en el CTA
    // final") no tiene posiciones capturadas y no se inventó: cuando se
    // compongan esos ángulos, se agregan a este array.
    at: 1,
    name: 'cierre',
    ease: 'arrive',
    pose: { angleDeg: 360, height: 6.25, distance: 30, frameX: -0.02, frameY: 0, keyIntensity: 0.2, keyKelvin: 7850 },
  },
]

/** Puntos de control de cada curva nombrada, tal cual los define el sistema. */
export const CHOREO_EASE_POINTS: Record<MotionEaseName, readonly [number, number, number, number]> =
  MOTION_EASE

// ════════════════════════════════════════════════════════════════════════════
// FÍSICA
// ════════════════════════════════════════════════════════════════════════════
//
// Todo lo de acá abajo se aplica SOLO en modo coreografía y solo con la física
// encendida. En modo manual el probe se comporta exactamente como antes —
// directo, sin inercia, sin mouse y sin vira — para que siga sirviendo de
// instrumento de precisión y las mediciones ya publicadas sigan valiendo.
//
// Bajo `prefers-reduced-motion` no hay nada de esto: la cámara va directo a la
// posición del progreso.

// ── Inercia ─────────────────────────────────────────────────────────────────

/**
 * Constante de tiempo de la persecución amortiguada, POR CANAL, en segundos.
 * Es el tiempo en que se cubre el 63% de la distancia al objetivo; en ~3τ ya
 * llegó. τ más grande = más pesado, más inercia, más asentamiento al frenar.
 *
 * No son todos iguales a propósito: el ángulo y la distancia mueven una masa
 * grande y se sienten mejor pesados, el encuadre tiene que responder o el
 * scroll se siente pegajoso, y la luz asienta más lento porque un dimmer no
 * salta.
 *
 * La fórmula es independiente del framerate (`1 − e^(−dt/τ)`), así que estos
 * números significan lo mismo a 30 que a 144 fps.
 */
export const SETTLE_TAU: Record<ChoreoChannel, number> = {
  angleDeg: 0.28,
  height: 0.24,
  distance: 0.26,
  frameX: 0.2,
  frameY: 0.2,
  keyIntensity: 0.35,
  keyKelvin: 0.35,
}

/**
 * Umbral de asentamiento por canal, en las unidades de cada canal. Debajo de
 * esta diferencia se pega al objetivo en vez de seguir persiguiéndolo: una
 * exponencial nunca llega, y sin esto el store se escribiría eternamente con
 * micras de cambio que nadie ve.
 */
export const SETTLE_EPSILON: Record<ChoreoChannel, number> = {
  angleDeg: 0.01,
  height: 0.002,
  distance: 0.002,
  frameX: 0.0005,
  frameY: 0.0005,
  keyIntensity: 0.002,
  keyKelvin: 0.5,
}

// ── Offset de mouse ─────────────────────────────────────────────────────────

/**
 * El mouse MODULA la posición que determina el progreso, no la reemplaza.
 *
 * Toca dos canales y ninguno es el encuadre: así la pose que se copia del panel
 * sigue siendo exactamente la del track, sin el mouse encima.
 *
 * **Es relativo, no absoluto.** El azimut ya lo es (2,2° se ven igual a 6,3 que
 * a 30 de distancia); la altura se multiplica por la distancia para que el
 * desplazamiento EN PANTALLA sea el mismo en toda la órbita. Un offset fijo en
 * unidades de mundo sería un cimbronazo de cerca y nada de lejos.
 *
 * El feed del puntero es `state.pointer` de r3f — **no se agrega un listener
 * propio**: por la lección ya documentada del repo, r3f v9 lo actualiza por su
 * cuenta sobre la caja del canvas.
 *
 * El signo es "mirar alrededor": mouse a la derecha → la cámara se corre a la
 * derecha y se ve más del costado derecho del objeto. Invertirlo es cambiarle
 * el signo a estas dos constantes.
 */
export const MOUSE_ANGLE_DEG = 2.2
export const MOUSE_HEIGHT_FACTOR = 0.045
/** El mouse ARRASTRA, no salta: constante de tiempo propia, más lenta que la del track. */
export const MOUSE_TAU = 0.45
export const MOUSE_EPSILON = 0.0005

// ── Vira en reposo ──────────────────────────────────────────────────────────

/**
 * Balanceo lento y continuo del logo — no una rotación. Es lo que impide que la
 * escena parezca congelada cuando el progreso está quieto.
 *
 * Dos senos de período INCONMENSURABLE (13 y 9,5 s): la combinación no se
 * repite a la vista, así que no se lee como un bucle. Amplitudes en grados,
 * deliberadamente por debajo del umbral en que se leería como "el objeto gira".
 *
 * Corre siempre, no solo con el progreso quieto: durante el recorrido queda
 * tapado por el movimiento de la cámara y apagarlo y prenderlo sería una
 * discontinuidad gratis.
 */
export const VIRA_YAW_DEG = 1.15
export const VIRA_PITCH_DEG = 0.7
export const VIRA_YAW_PERIOD_S = 13
export const VIRA_PITCH_PERIOD_S = 9.5
/** Desfase del pitch, en radianes. Sin él los dos senos cruzan el cero juntos. */
export const VIRA_PITCH_PHASE = 1.1

/**
 * ⚠️ **EL GASTO NUEVO MÁS GRANDE DE ESTE SPRINT, Y EL PRIMER CANDIDATO A
 * APAGAR SI MOBILE NO CIERRA.**
 *
 * Hoy el shadow map se calcula UNA VEZ y nunca más (`gl.shadowMap.autoUpdate =
 * false`): con la luz fija al mundo y el objeto quieto, el mapa de profundidad
 * es idéntico frame a frame. Que la cámara se mueva no lo invalida — una luz
 * direccional solo depende de la luz y de quién proyecta.
 *
 * Pero la vira mueve al que proyecta. Con el mapa congelado, la sombra se queda
 * desfasada del objeto que se balancea. Así que la vira obliga a **una pasada
 * de render de sombra completa por frame** (mapa de 2048²).
 *
 * `false` acá = se acepta la sombra estática y se recupera esa pasada. El
 * balanceo es de ~1°, así que el desfase es chico; es un intercambio real y
 * está a un booleano de distancia.
 */
export const VIRA_UPDATES_SHADOW = true

// ── Reproducción ────────────────────────────────────────────────────────────

/** Progreso por segundo del botón de reproducción. 0,07 = pasada completa en ~14 s. */
export const PLAY_SPEED_DEFAULT = 0.07
