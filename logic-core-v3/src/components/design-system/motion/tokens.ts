/**
 * Vocabulario de motion del sitio público (rediseño, S2-motion — Bloque 2).
 *
 * Por qué existe: el B1 de S2 relevó 31 físicas distintas conviviendo en el
 * home (8 curvas de easing, 10 configuraciones de spring, ninguna
 * tokenizada). "Que se sienta viva" no se logra con más efectos sino con UNA
 * física que los nueve componentes de S3-S6 comparten. Este módulo es esa
 * física — Bloque 3 construye las primitivas que la consumen.
 *
 * Espejado 1:1 por nombre en `globals.css` (`@theme static`, sección
 * "Motion — vocabulario del sistema"): Framer necesita arrays/números, CSS
 * necesita `cubic-bezier()`/unidades. Un puente por `getComputedStyle` cuesta
 * más (runtime + riesgo de SSR) que una duplicación explícita — si diverge,
 * la vitrina de `/styleguide` (Bloque 4c) lo expone visualmente.
 */

/** Escala del elemento que se mueve. `micro` no participa de los reveals de
 * entrada — es el único nivel para retroalimentación de estado (hover,
 * botón) sobre algo que YA está en pantalla, no que está llegando. */
export type MotionScale = 'micro' | 'elemento' | 'seccion' | 'pagina'

/**
 * Duraciones por escala, en segundos (formato que espera `motion/react`).
 *
 * - `micro` (0.15s) — hover, botón, cualquier respuesta a una acción sobre un
 *   elemento ya visible. Al límite superior de "retroalimentación
 *   inmediata": un instrumento de precisión responde ya, no titubea.
 * - `elemento` (0.6s) — una card entrando al viewport. Es el valor YA
 *   canónico de `CLAUDE.md` ("Framer Motion — section reveal": `duration:
 *   0.6, ease: [0.25, 0.46, 0.45, 0.94]`) — no se inventa un valor nuevo, se
 *   formaliza el que el propio documento no-negociable ya fijaba.
 * - `seccion` (0.8s) — la transición cromática entre secciones. Coincide con
 *   el tween ya calibrado de `HomeWrapper` (S1). Se documenta como magnitud
 *   de referencia con independencia de lo que decida el Bloque 4a sobre el
 *   mecanismo de disparo (temporal vs. ligado a `scrollYProgress`): si el
 *   disparo pasa a ser espacial, esta duración queda como el fallback de
 *   `prefers-reduced-motion` y para cualquier consumidor que no pueda atarse
 *   al progreso de scroll.
 * - `pagina` (1.2s) — el intro, un momento autoral de una sola vez. Magnitud
 *   documentada para el sistema; no se aplica a `Preloader.tsx` en este
 *   sprint (su coreografía interna es de otro bloque, fuera de scope: S2 no
 *   construye secciones ni retoca la orquestación del intro).
 */
export const MOTION_DURATION: Record<MotionScale, number> = {
  micro: 0.15,
  elemento: 0.6,
  seccion: 0.8,
  pagina: 1.2,
}

/** Nombre semántico de cada curva. Deliberadamente dos, no tres: los valores
 * ligados al progreso de scroll (Parallax, useScrollProgress) no necesitan
 * una curva temporal — su forma la da el mapeo entrada→salida del propio
 * rango (ver `useScrollProgress.ts`/`Parallax.tsx`), no un easing de tiempo.
 * Sumar una tercera curva "para scroll" sería tokenizar algo que no es una
 * curva. */
export type MotionEaseName = 'arrive' | 'shift'

/**
 * Curvas de easing, como arrays de 4 números (formato cubic-bezier que
 * `motion/react` consume directo en `transition.ease`).
 *
 * develOP se define como confiable, profesional, solucionador de
 * problemas — no juguetona ni lánguida. Las dos curvas elegidas leen esa
 * identidad en el carácter de la desaceleración, no en la velocidad:
 *
 * - `arrive` — `[0.25, 0.46, 0.45, 0.94]` (ease-out-quad). Es la curva
 *   canónica de `CLAUDE.md` para "section reveal" y la que ya vive en
 *   `ds-reveal`/`ds-rise`. Se eligió sobre las otras 2 variantes "confident
 *   arrival" que aparecían en el B1 (`[0.16,1,0.3,1]`, `[0.22,1,0.36,1]` —
 *   casi idénticas entre sí, familia expo-out) precisamente porque NO es esa
 *   familia: expo-out sube casi verticalmente al principio y se sintió
 *   evaluada como el registro más "efectista"/juguetón de las tres —
 *   ease-out-quad desacelera de forma más pareja y redondeada, sin el pico
 *   inicial abrupto. Se usa para todo lo que ENTRA a pantalla: reveals,
 *   transición cromática, el intro.
 * - `shift` — `[0.4, 0, 0.2, 1]` (curva estándar de Material, simétrica).
 *   Ya está en producción como `DOCK_EASE` (`DynamicDock.tsx:356`, el resize
 *   del dock) — se reutiliza el valor, no se inventa uno nuevo (principio de
 *   consolidación del B1). Se usa para cambios de estado sobre algo que YA
 *   está en pantalla (hover, botón, toggle): acelera y frena por igual en
 *   ambos extremos, sin el "asentamiento" de `arrive` — mecánico, no
 *   ceremonioso, apropiado para una reacción, no una llegada.
 *
 * Regla de uso: si el elemento está APARECIENDO, `arrive`. Si un elemento
 * QUE YA ESTABA VISIBLE cambia de estado, `shift`. No hay una curva de
 * salida separada en este sprint: ningún componente de S2 orquesta salidas
 * (los carruseles/sliders son S4-S6); cuando haga falta, la recomendación es
 * `shift` a la duración `micro` — más corta que la entrada, no una curva
 * nueva.
 */
export const MOTION_EASE: Record<MotionEaseName, [number, number, number, number]> = {
  arrive: [0.25, 0.46, 0.45, 0.94],
  shift: [0.4, 0, 0.2, 1],
}

/**
 * Distancia de entrada de los reveals, en píxeles. Un solo valor para todo
 * el sistema — el mismo `20` que `CLAUDE.md` ya fija en su ejemplo de
 * "section reveal" (`initial={{opacity:0, y:20}}`). Reemplaza los 16px de
 * `ds-reveal`/`ds-rise` (S1) y los 24/28/40px sueltos de las secciones
 * legacy (que mueren con sus componentes en S3-S6, no se migran).
 */
export const REVEAL_DISTANCE_PX = 20

/**
 * Desfase entre hermanos, en segundos, aplicado por índice.
 * 60ms es perceptible como secuencia intencional sin sentirse lento cuando
 * hay varios elementos — el B1 midió staggers existentes entre 28ms (About,
 * casi imperceptible) y 110ms (Portfolio, ya lento en listas largas).
 */
export const REVEAL_STAGGER_S = 0.06

/**
 * Tope de índice para el cálculo de stagger (0-based). Sin tope, un listado
 * de 20 elementos tardaría 20 × `REVEAL_STAGGER_S` en terminar de revelarse
 * — más de 1s solo de desfase. Con el tope en 5, el retraso adicional total
 * se estabiliza en 6 × 60ms = 360ms sin importar cuántos hermanos haya de
 * ahí en más: `delay = Math.min(index, REVEAL_MAX_STAGGER_INDEX) *
 * REVEAL_STAGGER_S`.
 */
export const REVEAL_MAX_STAGGER_INDEX = 5

/**
 * Umbral de disparo para `whileInView`/`useInView`: a qué porcentaje visible
 * se considera que un elemento "entró". `amount: 0.2` — ni tan temprano que
 * dispare apenas asoma (como los `viewport={{ once: true }}` sin `amount`
 * que el B1 encontró en `Footer.tsx`, que disparan con 1px visible) ni tan
 * tarde que se sienta reactivo en vez de anticipado. `once: true`: los
 * reveals de entrada son de una sola vez — no se re-disparan al hacer
 * scroll hacia atrás.
 */
export const REVEAL_VIEWPORT = {
  once: true,
  amount: 0.2,
} as const

/**
 * Contrato de `prefers-reduced-motion` para las primitivas de Bloque 3.
 *
 * Regla del documento: "las distancias van a cero y las duraciones se
 * acortan drásticamente, pero los cambios de color y opacidad pueden
 * mantenerse suaves". Con `distancePx: 0` no queda nada que desplazar — el
 * componente no necesita además una duración reducida para el transform,
 * porque el inicio y el fin del movimiento son el mismo punto. Lo único que
 * conserva una duración explícita es la opacidad, que la regla permite
 * mantener suave: `opacityDurationS` es una fracción de `elemento` (0.6s) —
 * drásticamente más corta, pero no un corte instantáneo que se sienta como
 * parpadeo.
 *
 * El parallax (Bloque 3) no tiene duración que reducir — es continuo, no
 * temporal — así que bajo movimiento reducido su intensidad se fuerza a 0 en
 * el propio componente, aplicando el mismo principio de "distancia a cero"
 * a un valor que no es un tween.
 */
export const REDUCED_MOTION = {
  distancePx: 0,
  opacityDurationS: 0.2,
} as const
