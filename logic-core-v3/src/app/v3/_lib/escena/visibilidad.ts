/**
 * EL ENCHUFE DE LA VISIBILIDAD — cuándo la escena tiene que estar dibujando.
 *
 * ⚠ **LA FORMA LA FIJÓ LA FASE 0 DE SITIO-S9 Y EL CUERPO LO LLENÓ EL FRENTE DE
 * LA VISIBILIDAD.** Lo que la Fase 0 fija es la FORMA —qué exporta, con qué
 * firma y qué propiedades tiene que cumplir— para que `EscenaDelHome.tsx` pueda
 * consumirlo sin que dos frentes escriban el mismo archivo.
 *
 * ── LA PREGUNTA, y por qué se midió antes de construir ─────────────────────
 *
 * §2.4 de `DIRECCION-ESCENA.md` pide que la escena *"se apague y vuelva"*. La
 * premisa de la instrucción de SITIO-S9 es que **eso puede ser más barato de lo
 * que ese texto imagina**: si en las secciones opacas la sala ya está tapada por
 * el panel, lo que falta no es un efecto visual sino **dejar de renderizar**.
 *
 * `_lib/superficies.ts` declara `dejaVerElCanvas` por modo de superficie y
 * `secciones.ts` asigna uno a cada sección: de esas dos tablas sale, derivada,
 * la lista de ventanas de scroll en las que hay un panel transparente en cuadro
 * (`ANCLAJE.ventanasDeLaEscena`).
 *
 * ⚠ **LA PREMISA SE SOSTIENE, Y ESTÁ MEDIDA** en `s9-visibilidad.invariant.ts`
 * §1, que renderiza los ocho paneles de verdad y mira el marcado que sale:
 * **seis de las ocho secciones son opacas** —no cinco, y la corrección va con su
 * instrumento al lado—, **el 85,7% del documento es panel opaco**, las ocho
 * emiten el relleno que su superficie declara, ninguna lo punciona con un
 * margen, un radio, un alfa ni un modo de mezcla, y la pila no deja un hueco
 * entre secciones. **No hay ningún momento en que la sala asome detrás de un
 * panel opaco, así que no hay efecto que componer** — si lo hubiera sería §7.4 y
 * lo decidiría el humano, no este archivo.
 *
 * ── SUSPENDER NO ES DESMONTAR ──────────────────────────────────────────────
 *
 * El contrato del `frameloop` de `ProbeStage` lo explica del lado del canvas:
 * `'never'` para el `rAF` y no dibuja, pero el contexto de WebGL, las texturas,
 * el `shadow map` y el árbol siguen vivos. **Volver tiene que costar un cuadro,
 * no un montaje** — remontar la escena cuesta lo que costó montarla.
 *
 * ── Y VOLVER TIENE QUE SER SIN SALTO, que no sale gratis ───────────────────
 *
 * `OrbitRig` **persigue** la pose del progreso con amortiguación (§2.3): no
 * salta a ella. Mientras el lazo está suspendido, `useProgresoDelScroll` sigue
 * escribiendo `rig.progress` —es un listener de scroll, no un `useFrame`— así
 * que al volver el objetivo está al día y **la pose amortiguada está vieja**.
 * Y el `delta` del primer cuadro no la salva: `setFrameloop` de r3f para y
 * reinicia el reloj, así que ese `delta` es el de un cuadro normal (~16 ms) y no
 * el de la pausa entera. Con `SETTLE_TAU` entre 0,20 y 0,28 s, volver sin hacer
 * nada sería un latigazo de ~1 s desde la pose vieja hasta la nueva, visto por
 * la rendija del panel que está entrando.
 *
 * **Por eso hay una fase intermedia y no un booleano.** En `reanudando` el lazo
 * ya corre y la física está APAGADA, que es el camino que `OrbitRig` ya tiene
 * escrito para eso: con `physics` en `false` la pose se escribe con
 * `live[canal] = target[canal]`, o sea **la pose exacta del progreso, sin
 * perseguirla**. Es el mismo mecanismo con el que el intro retiene la escena, y
 * no agrega una línea al rig.
 *
 * ── LA REGLA DE IDENTIDAD, que no es un detalle de estilo ──────────────────
 *
 * ⚠ **`siguiente()` tiene que devolver EL MISMO objeto cuando no hay
 * transición.** El enchufe la llama en cada cuadro de scroll con
 * `setEstado(previo => siguiente(previo, …))`; si devolviera un objeto nuevo
 * cada vez, React no podría descartar la actualización y el componente se
 * re-renderizaría **en cada cuadro de scroll**, que es exactamente el costo que
 * este frente existe para no pagar. El invariante lo afirma por identidad
 * (`===`), no por igualdad estructural.
 */

import { ANCLAJE, pantallaDeScroll } from './anclaje'

/**
 * Las tres fases, y qué significa cada una para el canvas.
 *
 * - `corriendo` — hay un panel transparente en cuadro. Lazo `'always'`, física
 *   puesta. Es el estado en el que la escena se ve.
 * - `suspendida` — no hay ninguno. Lazo `'never'`: cero cuadros dibujados, cero
 *   `useFrame`, y **nada desmontado**.
 * - `reanudando` — el lazo volvió y la pose todavía está vieja. Lazo `'always'`
 *   con la física apagada, que es lo que hace que el primer cuadro pintado
 *   muestre la pose EXACTA del progreso de hoy y no una interpolación desde la
 *   de hace diez pantallas.
 */
export type FaseDeLaEscena = 'corriendo' | 'suspendida' | 'reanudando'

export type EstadoDeLaEscena = {
  readonly fase: FaseDeLaEscena
  /** Cuadros pintados desde que se volvió. Sólo significa algo en `reanudando`. */
  readonly cuadros: number
}

/**
 * Los dos eventos que mueven la máquina, y son de naturalezas distintas: uno
 * viene del scroll (¿hay un panel transparente en cuadro?) y el otro del
 * navegador (se pintó un cuadro). Mezclarlos en un solo booleano fue la primera
 * forma y no cierra: «volvió a haber panel» y «ya pintaste» no son lo mismo.
 */
export type EventoDeLaEscena =
  | { readonly tipo: 'cuadro'; readonly enCuadro: boolean }
  | { readonly tipo: 'pintado' }

/**
 * Arranca en `corriendo` y no en `suspendida`, y es a propósito: el Hero es la
 * primera sección y es transparente, así que la escena se ve desde el primer
 * píxel. Arrancar suspendida agregaría una transición a la carga, que es el
 * único momento en el que no hay ninguna que ahorrar.
 */
export const ESTADO_INICIAL: EstadoDeLaEscena = { fase: 'corriendo', cuadros: 0 }

/**
 * CUÁNTO ANTES SE ENCIENDE LA ESCENA, en pantallas de scroll. **0,125.**
 *
 * ── Por qué hace falta un margen si la ventana ya es exacta ────────────────
 *
 * La ventana derivada NO tiene holgura: `por-que-develop` ocupa las pantallas
 * 12 a 13 del documento y está en cuadro exactamente mientras el scroll va de
 * 11 a 13, que es la ventana `[11, 13]` con sus bordes tocándose. Sin margen, el
 * lazo arranca **en el instante en que el borde del panel toca el borde del
 * cuadro**, y el primer cuadro pintado llega un `rAF` después. Lo que se vería
 * en esa rendija no es negro —con el lazo en `'never'` el canvas conserva lo
 * último que pintó— es **la pose vieja**, la de hace diez pantallas.
 *
 * ── El número, derivado de lo que tiene que durar ──────────────────────────
 *
 * El margen tiene que durar **`CUADROS_DE_REANUDACION` cuadros al ritmo de
 * scroll que se quiera cubrir**. El número se calibró con la reanudación en DOS
 * cuadros: 0,125 pantallas entre 2 son 0,0625 por cuadro, o sea **3,75 pantallas
 * por segundo a 60 Hz** — 112 px por cuadro en una ventana de 900. Cubre la
 * rueda y el teclado; **no** cubre una barra de scroll arrastrada, y ningún
 * margen finito la cubre. Lo que ahí se ve es a lo sumo UN cuadro de pose vieja,
 * no una pantalla apagada.
 *
 * ⚠ **El margen NO se bajó cuando la reanudación pasó de 2 cuadros a 1 en
 * SITIO-S11, y es deliberado.** Con un solo cuadro, los mismos 0,125 cubren
 * **7,5 pantallas por segundo**: el doble de ritmo de scroll. Lo que era exacto
 * pasó a ser holgado, y holgado es el lado seguro de esta perilla —lo que el
 * margen compra es que no se vea una pose de hace diez pantallas—. Bajarlo a
 * 0,0625 recuperaría 0,125 pantallas de banda suspendida sobre 13, o sea menos
 * de un punto de los 75, a cambio de perder toda la holgura. `s10-raf` §6 afirma
 * la DESIGUALDAD y no la igualdad justamente por esto.
 *
 * ── Lo que cuesta, medido ──────────────────────────────────────────────────
 *
 * Se aplica a los dos bordes de las dos ventanas y sólo dos de esos cuatro caen
 * dentro del recorrido, así que son 0,25 pantallas de las 13: la banda
 * suspendida baja de 10 pantallas a 9,75, o sea de **76,9% a 75,0%** del
 * recorrido. **1,9 puntos**, y lo publica `s9-visibilidad.invariant.ts` §4
 * muestreando esta función, no recalculando la cuenta de arriba.
 *
 * Es simétrico porque el scroll va en los dos sentidos: la entrada de una
 * ventana bajando es la salida de la otra subiendo.
 */
export const MARGEN_DE_REANUDACION = 0.125

/**
 * CUÁNTOS CUADROS SE QUEDA EN `reanudando`. **Uno.**
 *
 * Por la matemática alcanza **uno**: con `physics` en `false`, `OrbitRig`
 * escribe `live[canal] = target[canal]` en su primer `useFrame`, o sea la pose
 * exacta del progreso, sin perseguirla. Un cuadro y la pose está al día.
 *
 * ── ⚠️ ERAN DOS, Y LA RAZÓN ERA UNA CREENCIA QUE SITIO-S10 MIDIÓ Y REFUTÓ ──
 *
 * El pulso que despacha `'pintado'` vive en un `requestAnimationFrame` del
 * documento (`EscenaDelHome`) y el lazo de r3f vive en el suyo. **Eran dos
 * porque el orden entre los dos se creía indeterminado**: con un solo cuadro, si
 * el pulso corriera primero, la física se encendería ANTES del cuadro exacto y
 * el latigazo vuelve entero — un fallo intermitente que depende del orden de
 * registro, que es la peor clase. El segundo tick compraba independencia de ese
 * orden. §7.34 lo escribía con estas palabras: *«nada ordena un `rAF` respecto
 * del otro»*, y lo declaraba **deducido leyendo el código, no medido**.
 *
 * **Está medido, y es al revés: el orden de registro ESTÁ determinado y r3f va
 * PRIMERO.** Lo produce `_lib/__tests__/s10-raf.invariant.ts` —28 afirmaciones y
 * 14 controles positivos— derivando la cadena eslabón por eslabón del código
 * INSTALADO (`@react-three/fiber` 9.6.1), con un control positivo por eslabón.
 * Los dos registros salen del MISMO commit y en fases distintas: el `<Canvas>`
 * reconfigura desde un efecto de **layout** sin arreglo de dependencias →
 * `setFrameloop('always')` escribe el estado → `rootStore.subscribe(… invalidate
 * …)` hace `requestAnimationFrame(loop)` (registro 1); recién después corre el
 * efecto **pasivo** que arma el pulso (registro 2). React vacía los efectos de
 * layout antes que los pasivos y `rAF` despacha en orden de registro. Y una vez
 * corriendo, `loop()` se re-registra como su primera sentencia, antes de correr
 * un solo efecto — así que el orden se sostiene cuadro a cuadro y no sólo en el
 * primero.
 *
 * **SITIO-S10 midió y no tocó el número, a propósito**: bajarlo era una decisión
 * y su instrucción se lo prohibía. SITIO-S11 la toma, citando esa medición.
 *
 * ── Lo que cuesta y lo que devuelve ───────────────────────────────────────
 *
 * Costaba **2 cuadros = 33 ms sin inercia por reanudación**; cuesta **1 = 16,7
 * ms**. No se ve en ninguno de los dos casos, porque la inercia sólo importa
 * mientras la pose se persigue y al reanudar ya está alcanzada — lo que se gana
 * es que la ventana en la que la escena corre sin física sea la mínima que la
 * mecánica admite, en vez de la mínima más un cuadro de seguro contra algo que
 * no pasa.
 *
 * ⚠ **EL HUECO QUE QUEDA, DECLARADO.** Lo medido es el orden de REGISTRO, que es
 * una propiedad del código. Que el planificador del navegador los DESPACHE en
 * ese orden en una corrida real pide una traza con la pestaña AL FRENTE, y con
 * la pestaña ocluida el navegador ni despacha `rAF` (`CLAUDE.md`): va como
 * `noCorre` en el §5 de ese invariante. Si esa traza alguna vez mostrara lo
 * contrario, **el arreglo es volver a 2 acá y nada más** — el margen de
 * reanudación ya cubre los dos casos, ver abajo.
 */
export const CUADROS_DE_REANUDACION = 1

/**
 * ¿Hay un panel transparente en cuadro?
 *
 * Sale de `ANCLAJE.ventanasDeLaEscena` —derivadas de `secciones.ts` y de
 * `superficies.ts`, no escritas a mano acá— y de `pantallaDeScroll`, que es la
 * coordenada COMPARTIDA con el mapeo. Este archivo no convierte scroll a
 * pantallas por su cuenta: si lo hiciera, la escena podría encenderse en un
 * lugar distinto de donde el mapeo cree que está, y ningún invariante de
 * ninguno de los dos frentes lo vería.
 *
 * Los cuatro argumentos entran; no se leen de `window` acá: es lo que permite que
 * el invariante corra la MISMA función sin DOM, y la mitad de la lección de
 * `CLAUDE.md` sobre medir scroll con la pestaña oculta.
 *
 * ⚠ **V3-B: el segundo y el tercero son la EXTENSIÓN DE LAS SECCIONES**, no el
 * alto del documento — el mismo cambio que el mapeo y por la misma razón, que
 * está en `pantallaDeScroll`. Tiene que ser el mismo o los dos frentes volverían
 * a traducir el scroll con dos reglas distintas.
 *
 * ⚠ **Los dos casos degenerados devuelven `true`, y es el lado seguro.** Unas
 * secciones que no scrollean —o la pestaña oculta, donde toda medida da cero—
 * caen en la pantalla 0, que es el hero y es transparente. Una medición que no es
 * un número se atrapa aparte: sin esa guarda, `NaN` fallaría las dos
 * comparaciones y **apagaría** la escena, que es el error que no se puede cometer
 * —encendido de más cuesta cuadros; apagado de más deja la sala vieja en cuadro—.
 */
export function escenaEnCuadro(
  scrollY: number,
  arribaDeLasSecciones: number,
  abajoDeLasSecciones: number,
  altoDeLaVentana: number,
): boolean {
  const pantalla = pantallaDeScroll(
    scrollY,
    arribaDeLasSecciones,
    abajoDeLasSecciones,
    altoDeLaVentana,
  )
  if (!Number.isFinite(pantalla)) return true
  return ANCLAJE.ventanasDeLaEscena.some(
    ([desde, hasta]) =>
      pantalla >= desde - MARGEN_DE_REANUDACION && pantalla <= hasta + MARGEN_DE_REANUDACION,
  )
}

/**
 * Los tres estados, **como valores únicos y no como objetos nuevos**. Es la
 * regla de identidad del otro lado: entrar dos veces a la misma fase devuelve el
 * mismo objeto, así que ni siquiera la transición de ida y vuelta asigna.
 * `corriendo` ES el estado inicial porque no hay dos formas de estar corriendo.
 */
const CORRIENDO = ESTADO_INICIAL
const SUSPENDIDA: EstadoDeLaEscena = { fase: 'suspendida', cuadros: 0 }
const REANUDANDO: EstadoDeLaEscena = { fase: 'reanudando', cuadros: 0 }

/**
 * La transición. Pura, y **devuelve el mismo objeto cuando no hay transición**
 * — ver la regla de identidad en la cabecera.
 *
 * ── Las tres decisiones que no se leen del código de un vistazo ────────────
 *
 * 1. **`'pintado'` fuera de `reanudando` no mueve nada.** No es un evento que
 *    haya que ignorar defensivamente: es que sólo significa algo mientras se
 *    cuenta la reanudación. Devolver el mismo objeto lo vuelve inofensivo.
 * 2. **`reanudando` + «sigue en cuadro» NO reinicia la cuenta.** El scroll
 *    dispara en cada cuadro mientras la escena vuelve; reiniciar dejaría la
 *    física apagada mientras el dedo no se levanta.
 * 3. **De `suspendida` no se sale a `corriendo`.** El único camino pasa por
 *    `reanudando`, que es donde la física apagada hace que el primer cuadro
 *    pintado sea la pose exacta. Es la propiedad que el invariante afirma
 *    exhaustivamente, no una consecuencia de cómo quedaron escritos los `if`.
 */
export function siguiente(estado: EstadoDeLaEscena, evento: EventoDeLaEscena): EstadoDeLaEscena {
  if (evento.tipo === 'cuadro') {
    if (!evento.enCuadro) return estado.fase === 'suspendida' ? estado : SUSPENDIDA
    return estado.fase === 'suspendida' ? REANUDANDO : estado
  }
  if (estado.fase !== 'reanudando') return estado
  const cuadros = estado.cuadros + 1
  return cuadros >= CUADROS_DE_REANUDACION ? CORRIENDO : { fase: 'reanudando', cuadros }
}

/** Qué lazo de render le toca al canvas en cada fase. */
export function frameloopDe(estado: EstadoDeLaEscena): 'always' | 'never' {
  return estado.fase === 'suspendida' ? 'never' : 'always'
}

/**
 * Si la física —inercia, mouse y vira— corre en esta fase. En `reanudando` no:
 * es lo que hace que el primer cuadro pintado sea la pose exacta del progreso.
 */
export function fisicaEn(estado: EstadoDeLaEscena): boolean {
  return estado.fase === 'corriendo'
}
