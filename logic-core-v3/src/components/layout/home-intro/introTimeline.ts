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
 * ── S8e: los tiempos del preloader clásico ─────────────────────────────────
 *
 * Los MECANISMOS de S8d quedaron intactos; lo que cambió son los números. Cada
 * perilla con equivalente en el preloader clásico (`src/components/ui/
 * Preloader.tsx` + `IntroLockupText.tsx`, los de `main`) tomó su valor:
 *
 *     trazo   0,85 s  ← HOME_STROKE_SECONDS
 *     relleno 0,45 s  ← HOME_FILL_SECONDS
 *     color   1,40 s  ← VEIL_FADE_SECONDS
 *
 * Dos perillas con equivalente NO lo tomaron, cada una por su motivo:
 *
 *  · La espera bajó de los 1,5 s del clásico (`READ_HOLD_MS`) a 0,95 s, que era
 *    la instrucción: ese hold era tiempo literalmente muerto.
 *  · **El acomodamiento NO adoptó `COMPRESS_SECONDS` (0,78 s)**, y quedó en
 *    2,4 s. Allá el gesto era un deslizamiento corto sobre una pantalla que ya
 *    tenía el contenido detrás; acá es un viaje con giro que entrega la escena
 *    3D. Ver su docblock: **es la única perilla que se decide mirando.**
 *
 * Y otros tres números del clásico no se adoptaron porque acá ni siquiera hay
 * perilla que mover: su equivalente está atado por una propiedad —
 * `WRITE_MS`/`ERASE_MS` (1,5 s, ver `LINE_IN_DURATION_FRAC`) y
 * `HOME_CROSSFADE_SECONDS` (0,4 s, ver `SWAP_FRAC`).
 *
 * Total: **7,35 s**, contra los 7,27 s del clásico y los 8,15 s de S8d.
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
   *
   * S8e: **0,85 s, el `HOME_STROKE_SECONDS` del clásico.**
   */
  strokeS: 0.85,
  /**
   * EL RELLENO. El contorno se completa y la tinta blanca lo llena.
   *
   * S8e: **0,45 s, el `HOME_FILL_SECONDS` del clásico.**
   */
  fillS: 0.45,
  /**
   * LA ESPERA. Quietud con el lockup ya completo y legible.
   *
   * Es el `READ_HOLD_MS` del clásico (1,5 s) y **la única perilla que S8e NO
   * copia**: era tiempo literalmente muerto (`await wait(READ_HOLD_MS)`, sin un
   * solo canal animándose) y la instrucción fue bajarla.
   *
   * Se bajó preservando la LECTURA, no el número. En el clásico el lockup queda
   * terminado en pantalla 1,70 s (la escritura cerraba en 3,05 s y el borrado
   * arrancaba en 4,75 s). Acá las letras terminan de aparecer 0,535 s antes de
   * que empiece la espera —el 10% final del trazo más el relleno entero corren
   * con el texto ya completo y quieto—, así que 1,50 − 0,535 ≈ 0,95 s deja
   * **1,485 s de lockup terminado**, casi lo mismo, con 0,55 s menos de reloj.
   *
   * Si al mirarlo se siente apurada, esta es la perilla: 1,15 s reconstruye la
   * ventana de lectura del clásico exacta.
   */
  holdS: 0.95,
  /**
   * LA TRANSFORMACIÓN DE COLOR. El fondo pasa de oscuro a claro, la tinta de
   * blanco a negro, y **adentro de esta ventana el logo pasa de SVG a mesh**.
   *
   * S8e: **1,4 s, el `VEIL_FADE_SECONDS` del clásico** — el mismo recorrido
   * (oscuro → claro) que allá abría la secuencia y acá la parte al medio. Las
   * tres cosas que cambian acá no comparten la misma sub-ventana — ver
   * `INK_FLIP_FRAC`.
   *
   * Consecuencia medida, ahora en segundos (S8e arregló el instrumento): el
   * cruce de contraste pasa de **0,031 s a 0,038 s** por debajo de 1,25:1, y de
   * 0,013 s a 0,015 s por debajo de 1,10:1. Los topes de `introSampling.
   * invariant.ts` son 0,100 s y 0,050 s —los 6 y 3 cuadros de S8d—, así que
   * queda con casi el triple de margen. Sin re-anclar `INK_FLIP_FRAC` habría
   * dado 0,048 s.
   */
  colorS: 1.4,
  /**
   * SE VA LA LETRA. `MOTION_DURATION.elemento`, el espejo exacto de su entrada
   * — mismo efecto, misma curva, misma duración. **Aprobado, no se toca.**
   *
   * S8e NO adoptó el `ERASE_MS` del clásico (1,5 s): es el espejo de su
   * `WRITE_MS` (1,5 s), y esa entrada no entra en un trazo de 0,85 s (ver
   * `LINE_IN_DURATION_FRAC`). Copiar solo la salida rompería la simetría que
   * las dos secuencias comparten, y además metería un número suelto donde la
   * comprobación exige el token del sistema.
   */
  letterOutS: MOTION_DURATION.elemento,
  /**
   * SE VA EL FONDO, y recién cuando la letra terminó de irse: van en ese orden
   * y no a la vez. 0,7 s, un poco más que la letra, porque lo que se disuelve
   * acá es toda la pantalla y no un elemento.
   *
   * **Sin equivalente en el clásico:** allá el fondo no se disuelve al final —
   * ya era blanco desde el primer paso, y lo único que quedaba era esperar
   * 240 ms a que entrara el contenido. Queda como estaba.
   */
  veilOutS: 0.7,
  /**
   * EL ACOMODAMIENTO. Lo último, y lo único que queda del final.
   *
   * 🔴 **LA ÚNICA PERILLA DE S8e QUE SE DECIDE MIRANDO, Y NO MIDIENDO.** Las
   * otras seis salen del clásico o de una propiedad; ésta no tiene respuesta
   * correcta en un archivo. **Los dos vecinos, para la grabación: si el final
   * queda atropellado, 3,0; si queda lento, 1,8.**
   *
   * **2,4 s.** No es el `COMPRESS_SECONDS` del clásico (0,78 s) y tampoco son
   * los 3,6 s de S8d:
   *
   *  · **0,78 s está rechazado.** Allá el gesto era un deslizamiento corto sobre
   *    una pantalla que ya tenía el contenido detrás; acá es un viaje con giro
   *    que **entrega la escena 3D**, y es el último cuadro antes del home. A
   *    0,78 s el pico se va a 1049 px/s y 65,3°/s — 4,6× la calibración que el
   *    dueño del proyecto aprobó mirando la pantalla.
   *  · **3,6 s tampoco**, porque entonces el sprint no acorta nada.
   *
   * Con `MOTION_EASE.shift` (pendiente máxima 2,735, ver `samplePlace`), sobre
   * los 299,3 px de recorrido y los 18,6° de rotación de desktop 1440×810, el
   * pico queda en **341 px/s y 21,2°/s**: 1,5× los 227 px/s y 14,1°/s de la
   * calibración aprobada, no 4,6×. Y solo en el medio del gesto, no al arranque.
   *
   * ⚠ **Los 371 px y los 23,5°/s que publica S8d son de antes de S9.** Aquel
   * recorrido salía del destino viejo (1086, 466); el definitivo es (1018, 428)
   * y acorta el viaje a 299,3 px — ver `scene-framing.invariant.ts`. Sobre la
   * base vieja los mismos 2,4 s dan 423 px/s y 35,3°/s contra 282 y 23,5: **el
   * 1,5× es el mismo en las dos bases**, porque es 3,6 / 2,4.
   */
  placeS: 2.4,
}

/**
 * Fases de REFERENCIA: el punto de calibración de las fracciones, no un valor
 * editable. Existe para que "en su default el intro usa exactamente la física
 * de S2" sea código y no una promesa.
 *
 * **Espeja siempre el `strokeS` del default**, y no se elige aparte: si se
 * quedara atrás, las líneas dejarían de entrar en `MOTION_DURATION.elemento` y
 * la comprobación `introTimeline.invariant.ts` lo canta.
 */
const REFERENCE_PHASES = { strokeS: 0.85 } as const

// ── Las fracciones ──────────────────────────────────────────────────────────

/**
 * Entrada de cada línea: `MOTION_DURATION.elemento` (0,6 s).
 *
 * **El `WRITE_MS` del clásico (1,5 s) no se puede adoptar**, y no por gusto:
 * allá la escritura corría EN PARALELO al trazo, al relleno y al crossfade
 * (1,7 s de ventana), y acá las letras viven ADENTRO del trazo y tienen que
 * asentar antes de que la línea se cierre. Con el trazo del clásico en 0,85 s
 * el techo es `0,85 × (1 − LINE_SETTLE_MARGIN_FRAC) = 0,765 s`, la mitad de lo
 * que el clásico usaba. Estirar el trazo para que entre sería cambiar el
 * número que sí se adoptó; dejar que se derrame sería cambiar el mecanismo.
 *
 * Efecto lateral bienvenido del trazo más corto: con 0,6 s de entrada sobre
 * 0,85 s de trazo, la primera línea arranca en 0,105 s — o sea prácticamente
 * junto con el trazo, que es el `TEXT_LEAD_MS = 0` del clásico.
 */
const LINE_IN_DURATION_FRAC = MOTION_DURATION.elemento / REFERENCE_PHASES.strokeS
/** Desfase entre las dos líneas: `REVEAL_STAGGER_S` (0,06 s). */
const LINE_STAGGER_FRAC = REVEAL_STAGGER_S / REFERENCE_PHASES.strokeS

/**
 * QUIETUD ANTES DE QUE CIERRE EL TRAZO, como fracción de `strokeS`. Las letras
 * asientan este respiro antes de que la línea se junte, así que el cierre y el
 * relleno ocurren sobre una pantalla quieta.
 *
 * **Exportada desde S13**, sin cambiar de valor: las dos ventanas de las
 * partículas se cierran con el MISMO respiro antes del final de su fase — la
 * densidad completa antes de que se vaya la letra, y el campo afuera antes de
 * que arranque el fondo. Es un respiro compartido, no dos números iguales por
 * casualidad (`introParticleTiming.ts`).
 */
export const LINE_SETTLE_MARGIN_FRAC = 0.1

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
 * Por eso la tinta no usa la ventana entera: invierte en una franja central, con
 * la misma curva. El fondo se transforma despacio —eso es lo que se ve— y la
 * tinta lo cruza rápido por el medio. El cruce de contraste pasa de durar una
 * fracción larga de la transición a durar unas pocas decenas de milisegundos, y
 * la comprobación estática lo mide **en segundos, por interpolación** y exige
 * que se mantenga corto.
 *
 * **Este número no viene del clásico: allá no hay inversión de tinta.** El logo
 * se dibujaba NEGRO sobre un fondo que ya estaba yendo a blanco, así que no hay
 * un `HOME_*_SECONDS` que copiar. Lo que S8e sí hizo es re-anclarlo: al alargar
 * la transformación de 0,9 s a 1,4 s el 34% original habría ensanchado la
 * inversión de 0,306 s a 0,476 s, y `0,2186 × 1,4 s = 0,306 s` la deja en el
 * **mismo ancho** que S8d calibró.
 *
 * ⚠ **Preserva el ancho de la INVERSIÓN, no el del CRUCE.** S8e lo escribió como
 * si fueran lo mismo porque su instrumento contaba cuadros y no podía verlo. El
 * cruce depende de la velocidad RELATIVA de las dos luminancias, y el fondo pasó
 * a tardar 1,4 s en vez de 0,9 s: medido en segundos, el cruce por debajo de
 * 1,25:1 va de 0,031 s a **0,038 s**, un 22% más largo, no igual. Reproducirlo
 * exacto pediría la fracción 0,1607.
 *
 * **No se re-ancló de nuevo, y no es por conservadurismo:** 0,1607 × 1,4 s =
 * 0,225 s dejaría la inversión MÁS ANGOSTA que el relevo 2D→3D (0,252 s), y la
 * propiedad `3b · el relevo, adentro de la inversión` se rompería. Con 0,038 s
 * contra un tope de 0,100 s no hay nada que comprar con ese riesgo.
 */
const INK_FLIP_FRAC = 0.2186

/**
 * EL RELEVO 2D→3D, como fracción de la transformación y centrado en ella.
 *
 * Adentro de la inversión de la tinta y más corto todavía: cae donde el
 * contraste entre el logo y el fondo es mínimo, o sea **el mejor lugar posible
 * para esconder una sustitución**. Y como las dos capas llevan exactamente el
 * mismo color en cada instante (`introShading.ts` resuelve la emisiva del mesh
 * contra el mismo color que pinta el SVG), el cruce es invisible incluso si la
 * silueta estuviera corrida un sub-píxel.
 *
 * **El `HOME_CROSSFADE_SECONDS` del clásico (0,4 s) no se puede adoptar.** Allá
 * el relevo era un paso suelto de la secuencia y podía durar lo que quisiera;
 * acá tiene que esconderse ADENTRO de la inversión de la tinta, que dura 0,306 s
 * por diseño (ver `INK_FLIP_FRAC`). 0,4 s no entra en 0,306 s, y ensanchar la
 * inversión para que entre sería estirar el cruce de contraste, que es
 * exactamente el bug que S8d peleó.
 *
 * Queda en 0,18, que sobre la transformación del clásico da 0,252 s — más largo
 * que los 0,162 s de S8d, porque es fracción y el color creció.
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
