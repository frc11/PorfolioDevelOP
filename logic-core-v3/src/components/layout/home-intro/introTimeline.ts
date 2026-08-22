import {
  MOTION_DURATION,
  REVEAL_STAGGER_S,
} from '@/components/design-system/motion/tokens'

/**
 * EL RITMO DEL INTRO — datos y aritmética, sin un solo componente.
 *
 * Módulo puro a propósito: no importa React ni `motion`, así corre en node y su
 * comprobación estática (`introTimeline.invariant.ts`) puede verificarlo sin
 * DOM. Es el archivo que se abre para calibrar.
 *
 * ── S8d: siete beats en fila, sin golpes ───────────────────────────────────
 *
 * S8b y S8c construyeron un chasquido —corte de color y salto de escala en el
 * mismo frame— y un achicamiento. **Los dos se eliminaron.** Lo que queda es
 * una sola línea recta:
 *
 *   trazo → relleno → espera → TRANSFORMACIÓN DE COLOR → se va la letra →
 *   se va el fondo → el logo se acomoda
 *
 * Tres reglas nuevas ordenan todo lo demás:
 *
 *  1. **El logo NO cambia de tamaño en ningún momento.** Desde el primer frame
 *     tiene el tamaño que va a tener en la escena, leído del primer keyframe de
 *     la coreografía; el lockup se deriva de ese tamaño y no al revés.
 *  2. **El cambio de color es una transición con duración**, no un escalón, y
 *     el relevo 2D→3D ocurre adentro de ella.
 *  3. **El acomodamiento mueve y gira a la vez**, con un solo número.
 *
 * Cómo se LEE este ritmo en un instante vive en `introSampling.ts`, separado por
 * la misma regla que separa `choreography.ts` de `choreographySampler.ts` en el
 * probe: el archivo que se abre para calibrar tiene que ser todo dato.
 *
 * **Después de mover un número, correr la comprobación:**
 *
 *     npx tsx src/components/layout/home-intro/introTimeline.invariant.ts
 */

// ── Las siete perillas ──────────────────────────────────────────────────────

export type HomeIntroPhases = {
  readonly strokeS: number
  readonly fillS: number
  readonly holdS: number
  readonly colorS: number
  readonly letterOutS: number
  readonly veilOutS: number
  readonly placeS: number
}

export const HOME_INTRO_PHASES: HomeIntroPhases = {
  /**
   * PANTALLA OSCURA. El trazo dibuja el logo de punta a punta, en blanco, y
   * sobre el final aparecen "develOP" arriba y el slogan abajo.
   *
   * La pantalla oscura no se cobra tiempo aparte: el velo ya está pintado desde
   * el primer paint, así que la red y la hidratación SON el hold oscuro.
   */
  strokeS: 1.4,
  /** EL RELLENO. El contorno se completa y la tinta blanca lo llena. */
  fillS: 0.35,
  /**
   * LA ESPERA. Quietud con el lockup ya completo y legible.
   *
   * **Bajó de 1,0 s a 0,6 s.** En S8b y S8c era larga porque tenía que crear la
   * tensión que el chasquido descargaba; sin chasquido no hay tensión que
   * construir, solo un estado terminado que se deja leer. 0,6 s es
   * `MOTION_DURATION.elemento`: el tiempo que el sistema considera suficiente
   * para que algo se registre.
   */
  holdS: 0.6,
  /**
   * LA TRANSFORMACIÓN DE COLOR. El fondo pasa de oscuro a claro, la tinta de
   * blanco a negro, y **adentro de esta ventana el logo pasa de SVG a mesh**.
   *
   * 0,9 s para que se lea como transformación y no como corte: por debajo de
   * ~0,4 s el ojo la reconstruye como un salto. Las tres cosas que cambian acá
   * no comparten la misma sub-ventana — ver `INK_FLIP_FRAC`.
   */
  colorS: 0.9,
  /**
   * SE VA LA LETRA. `MOTION_DURATION.elemento`, el espejo exacto de su entrada
   * — mismo efecto, misma curva, misma duración. **Aprobado, no se toca.**
   */
  letterOutS: MOTION_DURATION.elemento,
  /**
   * SE VA EL FONDO, y recién cuando la letra terminó de irse: van en ese orden
   * y no a la vez. 0,7 s, un poco más que la letra, porque lo que se disuelve
   * acá es toda la pantalla y no un elemento.
   */
  veilOutS: 0.7,
  /**
   * EL ACOMODAMIENTO. Lo último, y lo único que queda del final.
   *
   * **3,6 s.** El humano reportó que a 3 s todavía se veía rápido, y la causa
   * no era solo la duración: era la curva. S8c usaba un expo-out que cubría el
   * 28% del camino en los primeros 90 ms — a 3 s eso son **~690 px/s desde el
   * primer frame**, y un arranque violento se lee como velocidad por más que el
   * gesto entero dure.
   *
   * Con `MOTION_EASE.shift` (ease-in-out, ver `samplePlace`) el gesto sale de
   * quieto y llega a quieto. Su pendiente máxima es 2,735, así que sobre los
   * 371 px de recorrido de desktop el pico queda en **282 px/s** —y solo en el
   * medio del gesto, no al principio—, con la rotación a 23,5°/s. Es menos de la
   * mitad del arranque anterior, repartido sobre 3,6 s en vez de 3.
   *
   * Es la perilla más cara de la secuencia: **es la primera que yo recortaría**
   * si el total de 8,15 s molesta.
   */
  placeS: 3.6,
}

/**
 * Fases de REFERENCIA: el punto de calibración de las fracciones, no un valor
 * editable. Existe para que "en su default el intro usa exactamente la física
 * de S2" sea código y no una promesa.
 */
const REFERENCE_PHASES = { strokeS: 1.4 } as const

// ── Las fracciones ──────────────────────────────────────────────────────────

/** Entrada de cada línea: `MOTION_DURATION.elemento` (0,6 s). */
const LINE_IN_DURATION_FRAC = MOTION_DURATION.elemento / REFERENCE_PHASES.strokeS
/** Desfase entre las dos líneas: `REVEAL_STAGGER_S` (0,06 s). */
const LINE_STAGGER_FRAC = REVEAL_STAGGER_S / REFERENCE_PHASES.strokeS

/**
 * QUIETUD ANTES DE QUE CIERRE EL TRAZO, como fracción de `strokeS`. Las letras
 * asientan este respiro antes de que la línea se junte, así que el cierre y el
 * relleno ocurren sobre una pantalla quieta.
 */
const LINE_SETTLE_MARGIN_FRAC = 0.1

/**
 * ⚠ **POR QUÉ LA TINTA NO INVIERTE AL MISMO RITMO QUE EL FONDO.**
 *
 * Hay un problema geométrico en "el fondo va de oscuro a claro **y** el logo de
 * blanco a negro": los dos arrancan en valores opuestos y terminan en los
 * opuestos cambiados, así que **por el teorema del valor intermedio son iguales
 * en algún instante.** En ese instante el logo tiene el color exacto del fondo y
 * desaparece. Es inevitable con dos recorridos continuos de luminancia; lo único
 * que se puede elegir es **cuánto dura**.
 *
 * Por eso la tinta no usa la ventana entera: invierte en el **34% central** de
 * la transformación, con la misma curva. El fondo se transforma despacio —eso es
 * lo que se ve— y la tinta lo cruza rápido por el medio. El cruce de contraste
 * pasa de durar una fracción larga de la transición a durar unos pocos cuadros,
 * y la comprobación estática lo mide y exige que se mantenga corto.
 */
const INK_FLIP_FRAC = 0.34

/**
 * EL RELEVO 2D→3D, como fracción de la transformación y centrado en ella.
 *
 * Adentro de la inversión de la tinta y más corto todavía: cae donde el
 * contraste entre el logo y el fondo es mínimo, o sea **el mejor lugar posible
 * para esconder una sustitución**. Y como las dos capas llevan exactamente el
 * mismo color en cada instante (`introShading.ts` resuelve la emisiva del mesh
 * contra el mismo color que pinta el SVG), el cruce es invisible incluso si la
 * silueta estuviera corrida un sub-píxel.
 */
const SWAP_FRAC = 0.18

// ── El lockup ───────────────────────────────────────────────────────────────

/**
 * EL TEXTO, EN PROPORCIONES DEL ALTO DE LA TINTA.
 *
 * S8b y S8c dimensionaban el logo desde la ventana (`heightVh`) y el texto desde
 * los tokens de tipografía. **Se invirtió:** ahora el logo lo fija la escena y el
 * texto se deriva de él, que es lo que pide la regla de "el logo no cambia de
 * tamaño". Así el lockup es una unidad rígida cuyas proporciones internas no
 * dependen de la ventana.
 *
 * Los números salen de que el conjunto entre cómodo: con el destino de desktop
 * (tinta de 364 px) el lockup completo mide ~552 px sobre 810 de alto, el 68%.
 * La misma proporción en 1920×1080 y bastante menos en mobile.
 *
 * El `font-size` va inline en píxeles y las clases del sistema se conservan: el
 * interlineado, el peso y el tracking son relativos al `em`, así que escalan
 * solos y no hay que replicarlos.
 */
export const INTRO_LOCKUP_TEXT = {
  /** Cuerpo de "develOP", como fracción del alto de la tinta. */
  wordmarkOfInk: 0.22,
  /** Cuerpo del slogan. */
  sloganOfInk: 0.075,
  /** Separación entre cada línea y el borde de la tinta. */
  gapOfInk: 0.085,
} as const

/**
 * LA SOMBRA QUE EL LOGO PROYECTA AL ENTRAR EN LA LUZ DE LA ESCENA.
 *
 * Aparece con la revelación, o sea **durante el acomodamiento**: mientras el
 * logo se lee como dibujo plano no hay luz encima y no hay nada que proyectar.
 *
 * `opacity: 0` la apaga entera — es la perilla para sacarla de un número si en
 * pantalla molesta. `distancePx` es a qué profundidad está el plano que la
 * recibe: con la principal de la escena (azimut −42°, elevación 36°) la sombra
 * cae abajo y a la derecha, a ~0,9 × esta distancia en X y ~0,98 en Y.
 */
export const INTRO_SHADOW = {
  opacity: 0.26,
  distancePx: 90,
} as const

/**
 * Espejo 1:1 de los tokens de color de `globals.css` (esta transformación se
 * interpola a mano, en luz lineal — ver `introShading.ts`). El claro es el MISMO
 * papel de la escena 3D (`DIRECCION-ESCENA.md` §4): por eso el fundido final es
 * casi invisible como cambio de fondo y lo único que se disuelve es el lockup.
 */
export const INTRO_COLORS = {
  bgDark: '#0E0E0E', // --color-ds-void
  bgLight: '#F7F7F5', // --color-ds-light-bg
  inkOnDark: '#F7F7F5', // --color-ds-dark-ink
  inkOnLight: '#111111', // --color-ds-ink
} as const

// ── La resolución ───────────────────────────────────────────────────────────

export type IntroTimeline = {
  /** Cuándo cierra el trazo. */
  readonly strokeEndS: number
  /** Cuándo el relleno está completo. */
  readonly fillEndS: number
  /** LA TRANSFORMACIÓN DE COLOR. */
  readonly colorStartS: number
  readonly colorEndS: number
  /** La inversión de la tinta, centrada adentro de la transformación. */
  readonly inkFlipStartS: number
  readonly inkFlipEndS: number
  /** El relevo 2D→3D, centrado adentro de la inversión. */
  readonly swapStartS: number
  readonly swapEndS: number
  /** Se va la letra, y recién después el fondo. */
  readonly letterOutStartS: number
  readonly letterOutEndS: number
  readonly veilOutStartS: number
  readonly veilOutEndS: number
  /** El acomodamiento: posición y orientación, con un solo número. */
  readonly placeStartS: number
  readonly wordmarkInS: number
  readonly sloganInS: number
  readonly lineInDurationS: number
  readonly totalS: number
}

export function buildTimeline(phases: HomeIntroPhases): IntroTimeline {
  const strokeEndS = phases.strokeS
  const fillEndS = strokeEndS + phases.fillS
  const colorStartS = fillEndS + phases.holdS
  const colorEndS = colorStartS + phases.colorS

  const colorMidS = (colorStartS + colorEndS) / 2
  const inkHalfS = (phases.colorS * INK_FLIP_FRAC) / 2
  const swapHalfS = (phases.colorS * SWAP_FRAC) / 2

  const letterOutStartS = colorEndS
  const letterOutEndS = letterOutStartS + phases.letterOutS
  // El orden es explícito en la instrucción: la letra termina de irse ANTES de
  // que el fondo empiece. Es un solo número con dos nombres, para que no se
  // pueda meter un solape sin querer.
  const veilOutStartS = letterOutEndS
  const veilOutEndS = veilOutStartS + phases.veilOutS

  const lineInDurationS = phases.strokeS * LINE_IN_DURATION_FRAC
  // La segunda línea manda: asienta el respiro antes del cierre del trazo, y la
  // primera se calcula hacia atrás desde ella con el desfase del sistema.
  const sloganInS =
    phases.strokeS * (1 - LINE_SETTLE_MARGIN_FRAC - LINE_IN_DURATION_FRAC)

  return {
    strokeEndS,
    fillEndS,
    colorStartS,
    colorEndS,
    inkFlipStartS: colorMidS - inkHalfS,
    inkFlipEndS: colorMidS + inkHalfS,
    swapStartS: colorMidS - swapHalfS,
    swapEndS: colorMidS + swapHalfS,
    letterOutStartS,
    letterOutEndS,
    veilOutStartS,
    veilOutEndS,
    placeStartS: veilOutEndS,
    wordmarkInS: sloganInS - phases.strokeS * LINE_STAGGER_FRAC,
    sloganInS,
    lineInDurationS,
    totalS: veilOutEndS + phases.placeS,
  }
}

export const HOME_INTRO_TIMELINE = buildTimeline(HOME_INTRO_PHASES)
