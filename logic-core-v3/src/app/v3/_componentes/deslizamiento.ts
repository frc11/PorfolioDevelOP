import { isSceneHeld, type IntroStage } from '@/components/layout/home-intro/introHandoff'

import { CURVAS, NOMBRE_EN_GSAP, type Curva, type NombreDeCurva } from '../_lib/motion/curvas'
import { ATRIBUTO_DE_PANEL, IDS_DE_SECCION } from '../_secciones/_contrato/forma'

/**
 * EL DESLIZAMIENTO DEL CTA DEL HERO — los datos y las compuertas, sin React.
 *
 * Vive aparte del efecto por la misma razón que `scrollSuave.ts` y
 * `compuerta.ts`: una decisión que sólo existe adentro de un `if` de un
 * `useEffect` **no se puede afirmar sin montar React con un DOM**, y montar un
 * DOM para comprobar una tabla de verdad de cuatro filas es una comprobación
 * peor que la lógica que comprueba.
 *
 * ── QUÉ HACE EL SPRINT, EN UNA LÍNEA ──────────────────────────────────────
 *
 * El CTA del hero apunta a `#trabajos` y hoy salta. Desde acá **se desliza**:
 * dos segundos de scroll animado, con el `<main>` apagado para que lo que se vea
 * durante el viaje sea la escena.
 *
 * ── ⚠️ EL DESTINO NO SE ESCRIBE ACÁ, Y ES LA DECISIÓN CENTRAL ─────────────
 *
 * El deslizamiento **no calcula a dónde va**: le pasa a Lenis el mismo destino
 * que el `<a>` lleva en su `href` y deja que lo resuelva `scrollTo`, que sobre
 * `lenis@1.3.25` hace —`lenis.mjs:770-778`— exactamente lo que hace el
 * navegador con un ancla:
 *
 *     target = rect.top + animatedScroll
 *            − getComputedStyle(node).scrollMarginTop
 *            − getComputedStyle(rootElement).scrollPaddingTop
 *
 * y `rootElement` es `document.documentElement` cuando el `wrapper` es `window`
 * (`lenis.mjs:938-940`), que es el caso: `OPCIONES_DE_LENIS` no declara
 * `wrapper`. O sea que **lee los 72 px de `_estilos/navegacion.css`**, los mismos
 * que despejan los quince enlaces del sitio, los mismos que
 * `BORDE_INFERIOR_EN_REPOSO_PX` deriva de los cuatro tokens de la pastilla.
 *
 * Es la diferencia entre frenar en el borde crudo de la sección y frenar donde
 * el ancla frena. A 1080 son **8.568 px y no 8.640**.
 *
 * ⚠️ **Y la consecuencia de esos 72 px, numerada como hallazgo propio:** el
 * destino cae ADENTRO del atardecer —el único tramo de una pantalla donde la luz
 * de la escena se va de 1 a 0,04—, así que **la luz de llegada depende del alto
 * de la ventana**. No es algo que este sprint introduzca: es una propiedad del
 * mecanismo de anclas que ya gobernaba los quince enlaces. Se mide en
 * `scripts-deslizar/a-llegada.ts` y está numerada en `DIRECCION-ESCENA.md` §7.
 *
 * ── ⚠️ POR QUÉ ES UN SOLO ENLACE Y NO LOS QUINCE ──────────────────────────
 *
 * Porque el mecanismo compartido no aterriza igual en todos. Con la misma curva
 * y el mismo destino calculado por `scrollTo`, `#por-que-develop` y `#cierre`
 * cruzan DOS VECES la banda en la que la escena se suspende —`visibilidad.ts`,
 * `pantalla ∈ (11,125 · 14,875)`— y `#tu-panel` aterriza adentro. Un
 * deslizamiento que atraviesa una banda suspendida muestra un `<main>` apagado
 * sobre una escena que no dibuja. El hero no tiene ese problema: va de la
 * pantalla 0 a la 8 y **las dos puntas y todo el medio están en zona de dibujo**.
 *
 * Los otros catorce siguen siendo el ancla nativa, y siguen andando.
 */

/* ── LOS CUATRO TIEMPOS DEL DESLIZAMIENTO. Se tocan a mano, en ms. ────────── */

/** Desde el click hasta que el `<main>` empieza a irse. */
export const RETARDO_ANTES_DE_DESAPARECER_MS = 0

/**
 * Cuánto tarda en desaparecer.
 *
 * ⚠ **YA NO ESPEJA `--duracion-rapida` (300 ms), y hay que decirlo.** La hoja
 * sigue fundiendo el velo en 300; este número bajó a 180 porque el arranque se
 * sentía tarde. La consecuencia es que **el viaje arranca antes de que el velo
 * termine de irse**: los últimos 120 ms del fundido corren ya en movimiento. Es
 * deliberado —es lo que saca la sensación de espera— y es reversible subiendo
 * este número a 300.
 */
export const DURACION_DE_DESAPARICION_MS = 180

/** Quieto en la escena, ya sin texto, antes de arrancar el recorrido. */
export const PAUSA_MS = 120

/** El recorrido: del hero a Trabajos. */
export const DURACION_DEL_VIAJE_MS = 2600

/* ────────────────────────────────────────────────────────────────────────── */

/** Del click al arranque del recorrido. Derivado de los tres primeros. */
export const PRELUDIO_MS = RETARDO_ANTES_DE_DESAPARECER_MS + DURACION_DE_DESAPARICION_MS + PAUSA_MS

/** El recorrido en SEGUNDOS, que es la unidad que `scrollTo` espera. */
export const DURACION_DEL_DESLIZAMIENTO_S = DURACION_DEL_VIAJE_MS / 1000

/** Del click al frenazo. Lo consume el reloj de seguridad. */
export const TOTAL_DEL_DESLIZAMIENTO_MS = PRELUDIO_MS + DURACION_DEL_VIAJE_MS

/**
 * 🔴 **LA CURVA DEL VIAJE — Y ESTE SPRINT LE DA UNA PROPIA, QUE ES UN COSTO.**
 *
 * ── Lo que DESLIZAR-1 hacía, y por qué estaba bien ────────────────────────
 *
 * No declaraba curva: `scrollTo` hereda `OPCIONES_DE_LENIS.easing` cuando no se
 * le pasa una (`lenis.mjs:746`), y esa configuración —la del sitio vivo— **es un
 * expoOut**. La razón era buena: no tener dos definiciones de la misma curva.
 *
 * ── Lo que la grabación mostró, y por qué alargar el expoOut no servía ────
 *
 * `expoOut` pone el 90 % del camino en los primeros 662 ms de los 2.000 y deja
 * 1,25 s de deriva casi quieta. Alargarlo **empeora justo eso**: suma más tiempo
 * de casi-quieto sin repartir el movimiento. El pedido era *«que baje un poco más
 * despacio, apreciando toda la escena»*, y eso pide una curva que reparta parejo
 * en el medio, no la misma curva más larga.
 *
 * Y hay un segundo motivo, medido en DESLIZAR-1 §5.2: **`expoOut` arranca a
 * velocidad MÁXIMA** —su derivada en `t = 0` vale `10 ln 2 = 6,93`— y por eso el
 * primer cuadro salta 1,43 alturas de cuadro, 46,6× el pico de un diente de
 * rueda. Una curva que **arranca en velocidad cero** lo elimina de raíz.
 *
 * ⚠ La duración ya no se deriva de la curva: son los cuatro tiempos de arriba.
 *
 * ── 🔴 EL COSTO, DECLARADO: SON DOS CURVAS, NO UNA DUPLICADA ──────────────
 *
 * Darle curva propia al viaje rompe la propiedad que DESLIZAR-1 cuidaba, y eso se
 * escribe en vez de esconderse (está numerado en `DIRECCION-ESCENA.md` §7.74).
 * Lo que hace el costo pagable es que **no son dos definiciones de la MISMA
 * curva: son dos curvas distintas, cada una con una sola definición, y el repo ya
 * documenta que son dos vocabularios separados** (`_lib/motion/curvas.ts`: *«son
 * OTRO VOCABULARIO. La referencia mantiene dos sistemas de easing separados y
 * medidos»*).
 *
 *   · **la RUEDA sigue con la del sitio**, `OPCIONES_DE_LENIS.easing`, y tiene que
 *     seguir: un gesto tiene que responder al instante, y para eso un arranque a
 *     velocidad máxima es lo correcto. Este sprint **no la toca**;
 *   · **el VIAJE usa `CURVAS.simetrica`**, que es `power1.inOut` — y no es una
 *     curva nueva: es una de las **seis del vocabulario de develOP**, la que la
 *     referencia usa en 11 de sus 278 tweens. Se IMPORTA de `curvas.ts`, no se
 *     reescribe, así que sigue habiendo una sola definición de ella también.
 *
 * `s18-deslizamiento.invariant` §4 afirma las dos mitades: que la rueda sigue con
 * la del sitio (leyendo el fuente de `SmoothScroll.tsx`) y que el viaje tiene la
 * suya, **y que las dos son distintas de verdad** (con la distancia medida entre
 * ellas, que es 0,4 y no un redondeo).
 *
 * ── Por qué `simetrica` y no `simetrica-suave` ────────────────────────────
 *
 * Los nombres del vocabulario son una trampa de lectura: `simetrica-suave` es
 * `power2.inOut` —una CÚBICA— y su pico vale 3, o sea que es **más** apretada en
 * el medio, no menos. `simetrica` es `power1.inOut`, la cuadrática, con pico 2:
 * de las dos simétricas es **la más parecida a la lineal**, y por lo tanto la que
 * reparte más parejo. Los números están en el instrumento.
 *
 * ⚠ Y `sine.inOut` sería todavía más plana (pico 1,571), pero **no se puede
 * usar**: `curvas.ts` la declara explícitamente fuera del vocabulario y la tiene
 * por una sola razón —ser el control externo con el que se verifica que nuestra
 * `simetrica` es la curva que dice ser—. Usarla como curva de producto le sacaría
 * al proyecto su vara de medición.
 */
// Más cola al final sin arrancar de golpe: `power2.inOut` deja el 6,25 % del camino
// para el último cuarto del tiempo contra el 12,5 % de `simetrica`, y sigue arrancando
// en velocidad cero. Es la de más cola de las seis que no arrancan de golpe.
export const NOMBRE_DE_LA_CURVA_DEL_VIAJE: NombreDeCurva = 'simetrica-suave'

/** La curva del viaje, importada del vocabulario. No hay una segunda copia. */
export const CURVA_DEL_VIAJE: Curva = CURVAS[NOMBRE_DE_LA_CURVA_DEL_VIAJE]

/** Su nombre en GSAP, para que el reporte se pueda cruzar contra SCROLL.md §9.4. */
export const CURVA_DEL_VIAJE_EN_GSAP: string = NOMBRE_EN_GSAP[NOMBRE_DE_LA_CURVA_DEL_VIAJE]

/**
 * EL ATRIBUTO DEL VELO — el que el efecto escribe en el `<main>` mientras vuela.
 *
 * Va como ATRIBUTO y no como clase por dos razones, y la segunda es la que
 * manda:
 *
 *   1. **No colisiona con React.** El `<main>` lo pinta `page.tsx`, que es un
 *      componente de SERVIDOR y un archivo PROHIBIDO por la frontera de S3.
 *      Toquetearle el `className` desde un efecto sería pisar el valor que el
 *      reconciliador cree que tiene; un atributo que React no conoce, no.
 *   2. **Es el idioma que /v3 ya usa para esto.** `ScrollSuaveDeV3` marca el
 *      `<html>` con `data-v3-scroll-suave` y el intro con `data-home-intro`. Un
 *      estado efímero que una hoja de estilos lee se dice con un atributo.
 */
export const ATRIBUTO_DEL_VELO = 'data-v3-deslizando'

/**
 * EL `<main>`, acotado al árbol de /v3.
 *
 * Hay exactamente uno y lo pinta `page.tsx:69`; `s10-banco` §2 lo afirma sobre
 * el documento compuesto, en las dos ramas. La marca `data-v3` la pone el
 * envoltorio de `layout.tsx:270` y acota la búsqueda al árbol nuevo: sin ella,
 * un `<main>` del sitio viejo entraría si algún día compartieran documento.
 */
export const SELECTOR_DEL_MAIN = '[data-v3] main'

/**
 * EL CTA DEL HERO, Y NADA MÁS.
 *
 * Se arma de dos piezas y ninguna es un literal suelto:
 *
 *   · `[data-panel="hero"]` sale de `ATRIBUTO_DE_PANEL` y de `IDS_DE_SECCION[0]`
 *     —la primera fila de `secciones.ts`—, que es de dónde `Panel` saca el `id`
 *     del `<section>`. Si alguien reordena la tabla, esto se mueve con ella;
 *   · `a[data-pieza="cta"]` es la forma que EMITE `Cta.tsx:127`. Ese `data-pieza`
 *     es un literal en el marcado y no hay constante que lo publique, así que
 *     `s18-deslizamiento.invariant.ts` §1 afirma que la cadena de acá aparece
 *     LITERALMENTE en el fuente de `Cta.tsx`. Es el mismo remedio que
 *     `trabajos.invariant.tsx` §1b le aplica al `data-panel` de `Panel.tsx`.
 *
 * El `<a>` del Cierre también lleva `data-pieza="cta"` —apunta a `#servicios`—
 * y queda afuera por el ancestro, no por el `href`.
 */
export const SELECTOR_DEL_CTA_DEL_HERO = `[${ATRIBUTO_DE_PANEL}="${IDS_DE_SECCION[0]}"] a[data-pieza="cta"]`

/**
 * 🔴 LA COMPUERTA DEL INTRO — el requisito, como función pura.
 *
 * ── El defecto que cierra ─────────────────────────────────────────────────
 *
 * Durante los ~7,1 s del intro el CTA **es clickeable**: el overlay es
 * `pointer-events-none`. Y en ese rato la escena está retenida en la pose 0
 * (`retencion.ts`) y `markIntroEntry()` todavía no muestreó el scroll —lo hace
 * UNA sola vez, en el instante en que la capa empieza a irse
 * (`HomeIntro.tsx:171-102`)—. Un deslizamiento ahí le pisa el dato al muestreo:
 * `introEnteredClean()` leería «el visitante se movió» por un click que el
 * visitante dio sobre una pantalla que todavía estaba tapada.
 *
 * ── ⚠️ POR QUÉ NO ES `etapa === 'clear'`, CON LA EVIDENCIA ────────────────
 *
 * La instrucción del sprint pide gatear sobre `getIntroStage() === 'clear'`.
 * **Esa forma rompe el pedido en toda visita repetida**, y la prueba está en el
 * propio contrato del intro:
 *
 *   · `markIntroPlayed()` publica `'clear'` **sólo si la escena estaba
 *     retenida** (`introBoot.tsx:91`, `if (isSceneHeld()) setIntroStage('clear')`);
 *   · cuando el intro NO corre —visita repetida, `prefers-reduced-motion`, o
 *     automatización— la etapa se queda en `'idle'` para siempre, y el comentario
 *     de `HomeIntro.tsx` lo escribe con esas palabras: *«`idle` significa "no hay
 *     intro", no "el intro terminó"»*.
 *
 * O sea que `=== 'clear'` dejaría el deslizamiento muerto en la segunda visita
 * de la sesión, y muerto también en toda medición automatizada (el gate
 * pre-paint no arma el intro con `navigator.webdriver`), que es la clase de
 * defecto que este repo ya cazó una vez: *«la escena congelada en la visita
 * repetida»*, catorce sprints invisible por esa misma razón.
 *
 * Lo que la instrucción quiere impedir es el click **mientras la capa tapa o se
 * está yendo**, y ése es exactamente `isSceneHeld`: el booleano que el propio
 * módulo publica para esa pregunta (`introHandoff.ts:124-126`). Se consume, no
 * se reescribe.
 */
export function deberiaDeslizar(etapa: IntroStage): boolean {
  return !isSceneHeld(etapa)
}
