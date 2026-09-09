import type { ChoreoChannel } from './choreographyTypes'

/**
 * LA FÍSICA DEL RIG — inercia, mouse, vira, deriva del aire y reproducción.
 *
 * Salió de `choreography.ts` en S6 para que ese archivo vuelva a ser lo que dice
 * ser: el recorrido y nada más. Acá está todo lo que modula ese recorrido sin
 * ser parte de él.
 *
 * Todo lo de este archivo se aplica SOLO en modo coreografía y solo con la
 * física encendida —salvo la deriva del aire, que se explica abajo—. En modo
 * manual el probe se comporta exactamente como antes: directo, sin inercia, sin
 * mouse y sin vira, para que siga sirviendo de instrumento de precisión y las
 * mediciones ya publicadas sigan valiendo.
 *
 * Bajo `prefers-reduced-motion` no hay nada de esto, deriva incluida: la cámara
 * va directo a la posición del progreso y la escena queda quieta.
 */

// ── Inercia ─────────────────────────────────────────────────────────────────

/**
 * Constante de tiempo de la persecución amortiguada, POR CANAL, en segundos.
 * Es el tiempo en que se cubre el 63% de la distancia al objetivo; en ~3τ ya
 * llegó. τ más grande = más pesado, más inercia, más asentamiento al frenar.
 *
 * No son todos iguales a propósito: el ángulo y la distancia mueven una masa
 * grande y se sienten mejor pesados, y el encuadre tiene que responder o el
 * scroll se siente pegajoso.
 *
 * **S6 sacó de acá los dos canales de luz.** La luz ya no se persigue por canal:
 * es una curva propia del progreso (`LIGHT_ARC`) y su suavizado es el de la
 * curva, no una amortiguación. Un dimmer que además arrastrara detrás de la
 * curva sería suavizar dos veces lo mismo.
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
 * ⚠️ **La altura del mouse es lo que fija el margen del piso.** En el keyframe
 * más bajo del recorrido, la cámara queda a `MOUSE_HEIGHT_FACTOR × distancia`
 * de irse abajo del papel. Ver la nota de `FLOOR_Y` en `probeScene.ts`: ese
 * margen es la razón por la que el logo flota sobre el piso en vez de apoyar.
 *
 * El feed del puntero es `state.pointer` de r3f — **no se agrega un listener
 * propio**: por la lección ya documentada del repo, r3f v9 lo actualiza por su
 * cuenta. ⚠️ **Pero en el home NO le llegaba, y B5 lo arregló en el `<Canvas>`**:
 * el div de eventos de r3f vive en `z-0` debajo de las ocho secciones, que son
 * `pointer-events: auto`. El porqué completo, con su control positivo, está en
 * los props `eventSource` / `eventPrefix` de `ProbeStage.tsx`.
 *
 * El signo es "mirar alrededor": mouse a la derecha → la cámara se corre a la
 * derecha y se ve más del costado derecho del objeto. Invertirlo es cambiarle
 * el signo a estas dos constantes.
 *
 * ── ⚠️ EL AZIMUT ES VARIABLE POR TRAMO, Y CADA TECHO ES SUYO ─────────
 *
 * El paralaje de mouse es **lo único que separaba a la referencia de nosotros**
 * —no una deriva autónoma, que ninguno de los dos tiene— y estaba medido en
 * **≥120 px de corrimiento contra nuestros 12**. Amplificarlo mueve dónde cae la
 * sala sobre el texto, así que el techo lo pone el contraste bajo el glifo.
 *
 * **Pero el contraste no es el mismo en todo el recorrido, y un techo único es
 * el mínimo global aplicado donde no hace falta.** Los lugares donde la escena
 * se ve son el hero, Trabajos (desde B6-A) y el diferencial con el Cierre, y
 * aguantan cosas muy distintas:
 *
 * | tramo | qué texto cae sobre la sala | techo medido |
 * |---|---|---|
 * | **hero** | el titular, 56 px sobre la pared clara | **22°** — y todavía sobra |
 * | **trabajos** (B6-A) | titular y bajada sobre el velo denso | **8°** — heredado del diferencial, sin medir con puntero |
 * | **cierre** | el cuerpo de 15 px del diferencial | **8°** — al borde de AA |
 *
 * Por eso `MOUSE_ANGLE_DEG` dejó de ser un escalar: es una tabla de nudos sobre
 * el progreso, y el muestreador vive en `modulacionDeLaPose.ts`. La primera
 * pantalla —la que se juzga— recibe el paralaje entero.
 *
 * ⚠️ **Y la rampa entre los dos valores vive donde la escena NO dibuja.** Entre
 * el final del hero y el principio de Trabajos la escena está suspendida
 * (`visibilidad.ts`), así que el cambio de amplitud no se ve: no hay un salto
 * de cámara al cruzar un borde de tramo. Desde Trabajos hasta el final el valor
 * ya es el del piso, 8°: Trabajos, el diferencial y el Cierre lo comparten.
 * `s18-azimut.invariant.ts` lo verifica muestreando la ventana de
 * visibilidad, no suponiéndolo.
 *
 * ── De dónde sale cada techo ──────────────────────────────────
 *
 * Medido con `scripts-b5/b-paralaje.ts` —máscara de glifo sin escena, cinco
 * posiciones de puntero más el par de media altura, mouse real por CDP— la
 * MEDIANA de contraste en la PEOR posición del puntero. El piso de AA es 3:1
 * para el titular (texto grande) y 4,5:1 para el cuerpo del diferencial.
 *
 * El del cierre se buscó por bisección: 2,2° → 4,58:1 · 8° → 4,52:1 ·
 * 22° → **4,35:1, bajo AA**. La caída es de ≈**0,011 por grado**, así que el
 * cruce está en ~9,5° y 8 es el último valor redondo por debajo.
 *
 * ⚠️ **Y la razón por la que el cierre no llega más arriba no es la cámara**:
 * es que el cuerpo del diferencial **ya arranca al borde de AA** —mediana
 * 4,65:1 con 33 % de sus píxeles bajo 4,5:1, con el puntero quieto en el centro
 * y sin tocar nada—. Es el defecto heredado D-B5.1; el día que se arregle, este
 * techo sube solo.
 */
export const AZIMUT_DEL_MOUSE_POR_PROGRESO: readonly (readonly [number, number])[] = [
  /**
   * ⚠️ **LOS DOS NUDOS DEL MEDIO SALEN DE LA VENTANA DE VISIBILIDAD, NO DE LA
   * TABLA DE TRAMOS.** Muestreando `escenaEnCuadro` sobre el documento entero, la
   * escena dibuja en **[0 · 0,1354]**, en **[0,4648 · 0,6286]** (Trabajos, desde
   * B6-A) y en **[0,7375 · 1]**; entre esas bandas el lazo está suspendido y no
   * se pinta un cuadro.
   *
   * Los bordes de TRAMO —0,125 y 0,75— caen del lado equivocado: el hero se ve
   * **hasta 0,1354**, o sea 0,0104 después de terminar su tramo, y el cierre
   * empieza a verse **en 0,7375**, o sea 0,0125 antes de empezar el suyo. Con la
   * rampa apoyada en los tramos, la amplitud cambiaba a la vista en **19
   * posiciones** del barrido — medido, y es lo que puso en rojo a
   * `s18-modulacion` §4b la primera vez.
   *
   * ⚠️ **B6-A movió el segundo nudo de 0,73 a 0,46.** Con Trabajos abierta, la
   * rampa 0,14 → 0,73 cruzaba su banda visible y la amplitud cambiaba a la vista
   * en **918 posiciones** —medido con la tabla abierta—. La rampa entera vive
   * ahora en la PRIMERA banda suspendida, [0,1354 · 0,4648]: 0,14 y 0,46 son los
   * primeros valores redondos adentro. Trabajos recibe el piso de 8° desde su
   * primer cuadro visible. El invariante no los da por buenos: vuelve a
   * muestrear la ventana y comprueba que cada nudo cae de su lado.
   */
  [0, 22],
  [0.14, 22],
  [0.46, 8],
  [1, 8],
]

/**
 * El valor de referencia del canal, para quien necesite UNO. Es el del hero —el
 * máximo de la tabla— y existe para que la excursión del peor caso se pueda
 * acotar sin muestrear: nada del recorrido pasa de acá.
 */
export const MOUSE_ANGLE_DEG_MAXIMO = 22

/**
 * ⚠️ **NO SE TOCÓ, Y TIENE UN TECHO GEOMÉTRICO CASI TOCADO.** En el keyframe
 * más bajo del recorrido —«quiénes somos», `height −3,6`, `distance 11,5`— la
 * cámara queda a `(height − FLOOR_Y) / distance` = **0,061217** de irse abajo
 * del papel. Con 0,045 quedan **1,36×** de holgura y nada más. Por eso B5
 * amplificó el AZIMUT y no la altura: el paralaje que falta es horizontal, y el
 * canal vertical no tiene de dónde sacarlo. `b5-modulacion.invariant.ts`
 * recalcula ese techo contra los keyframes y el `FLOOR_Y` reales.
 */
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
 * ⚠️ **EL PRIMER CANDIDATO A APAGAR SI MOBILE NO CIERRA — sigue siéndolo en S6,
 * y ahora cuesta menos.**
 *
 * El shadow map se calcula UNA VEZ y nunca más (`gl.shadowMap.autoUpdate =
 * false`): con la luz fija al mundo y el objeto quieto, el mapa de profundidad
 * es idéntico frame a frame. Que la cámara se mueva no lo invalida — una
 * direccional solo depende de la luz y de quién proyecta.
 *
 * Pero la vira mueve al que proyecta. Con el mapa congelado, la sombra se queda
 * desfasada del objeto que se balancea. Así que la vira obliga a **una pasada
 * de render de sombra completa por frame**.
 *
 * **S6 bajó el mapa de 2048² a 1024²**, o sea que esa pasada pasó a costar la
 * cuarta parte de lo que costaba. Sigue siendo la más cara de las que se pueden
 * apagar con un booleano: `false` acá acepta la sombra estática y la recupera
 * entera. El balanceo es de ~1°, así que el desfase es chico.
 */
export const VIRA_UPDATES_SHADOW = true

// ── Deriva del aire (S6) ────────────────────────────────────────────────────

/**
 * Los campos de partículas GIRAN, muy despacio, cada uno a su ritmo y en sentido
 * contrario.
 *
 * El sprint pide partículas "que se muevan lento y con vida propia, no
 * estáticas". Hay tres formas de conseguirlo y esta es la única que cuesta
 * cero por partícula:
 *
 * 1. Mover cada posición por frame — hay que volver a subir el buffer entero a
 *    la GPU en cada cuadro, para un movimiento que casi no se ve.
 * 2. Un shader propio con un seno del tiempo — lo más barato en runtime, pero
 *    es GLSL a mano que este sprint no puede verificar en pantalla.
 * 3. **Girar el grupo entero**: una matriz por campo, cero por partícula, cero
 *    subidas de buffer.
 *
 * Lo que hace que (3) no se lea como "el fondo gira" es que son DOS campos con
 * períodos inconmensurables y sentidos opuestos: al superponerse, el paralaje
 * entre ellos cambia todo el tiempo y ninguno de los dos ritmos se percibe. Es
 * el mismo truco de la vira, aplicado al aire.
 *
 * **El giro es solo sobre Y, y eso no es estético: es lo que garantiza que
 * ninguna partícula cruce el piso.** Los dos campos son media esfera recortada
 * por el papel; girando sobre el eje vertical cada partícula conserva su altura
 * exacta. El bamboleo vertical sí la cambia, y por eso su amplitud está muy por
 * debajo del margen que el recorte dejó (0,4 de mundo).
 *
 * Corre siempre que no haya `prefers-reduced-motion`, incluso con la física
 * apagada: apagar la física es para juzgar el track crudo de la cámara, y el
 * aire no interfiere con eso.
 */
/**
 * ── S10: LA DERIVA PASA A SER DIFERENCIAL ──────────────────────────────────
 *
 * Con 2.400 motas en vez de 220, girar el campo entero como un bloque deja de
 * funcionar: una nube rígida de ese tamaño se lee como un fondo que gira, que es
 * exactamente lo que la nota de arriba dice que hay que evitar. Y la salida NO
 * puede ser mover partícula por partícula — 2.400 motas son 7.200 floats y una
 * subida de buffer por cuadro.
 *
 * Cada campo se parte en **conchas por radio** (ver `DUST_SHELLS`) y cada concha
 * gira y cabecea con su propio período, **la interior más rápido**. Es rotación
 * diferencial: sigue costando una matriz por concha y cero por partícula, pero
 * ahora las capas se descorrelacionan entre sí y el aire se lee como aire.
 *
 * Los períodos son inconmensurables entre ellos, con los dos de la vira (13 y
 * 9,5) y con el de la envolvente (18,7), así que nada se sincroniza con nada.
 *
 * Un índice por concha, de adentro hacia afuera. Los arrays tienen que tener
 * `DUST_SHELLS.length - 1` y `BOKEH_SHELLS.length - 1` entradas — se verifica en
 * `s10-escena.invariant.ts`.
 */
export const DUST_SPIN_DEG_S: readonly number[] = [1.5, 0.9, 0.55]
export const DUST_BOB_AMPLITUDE: readonly number[] = [0.14, 0.1, 0.07]
export const DUST_BOB_PERIOD_S: readonly number[] = [12.7, 17, 22.3]
export const BOKEH_SPIN_DEG_S: readonly number[] = [-2.3, -1.6]
export const BOKEH_BOB_AMPLITUDE: readonly number[] = [0.16, 0.12]
export const BOKEH_BOB_PERIOD_S: readonly number[] = [11.5, 15.7]

// ── Reproducción ────────────────────────────────────────────────────────────

/** Progreso por segundo del botón de reproducción. 0,07 = pasada completa en ~14 s. */
export const PLAY_SPEED_DEFAULT = 0.07
