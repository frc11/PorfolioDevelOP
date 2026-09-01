/**
 * LA GEOMETRÍA DE LA SECCIÓN — las clases que las DOS ramas comparten, y las
 * de tipografía leídas de la tabla del sistema.
 *
 * ── Por qué las clases están escritas enteras y en un solo lugar ──────────
 *
 * Tailwind escanea el CÓDIGO FUENTE. Una clase armada como `min-h-${x}` no la
 * ve nadie y su regla no se emite nunca: queda el atributo en el HTML, sin un
 * error en consola, y la caja sin altura. Por eso acá son cadenas literales.
 *
 * Y están una sola vez porque las dos ramas —la pinneada y la apilada— tienen
 * que declarar la MISMA caja. Si cada una escribiera la suya, el día que una
 * cambie de alto la otra se queda atrás y nadie se entera hasta que alguien
 * mire mobile, que es justamente lo que nadie mira.
 *
 * ── El alto de un bloque es `min-h-svh`, no `h-svh` ───────────────────────
 *
 * `svh` y no `vh` porque en mobile la barra del navegador entra y sale, y con
 * `vh` cada bloque salta cuando se esconde. `min-h` y no `h` porque el
 * contenido de un servicio —párrafo, once ítems y el hueco del video— puede
 * pasarse de una pantalla en un viewport bajo, y un alto fijo lo recortaría.
 *
 * ⚠️ DECLARADO, NO MEDIDO: el rango del pin es `alto de la sección − alto del
 * `sticky``, y vale `alto − viewport` mientras el contenido entre en UNA
 * pantalla. Nadie lo miró todavía. Si el contenido se pasa, el pin recorre
 * menos de lo que declara `ANCLA_DEL_PIN` y la secuencia termina antes. Es la
 * primera cosa a mirar cuando alguien abra la página.
 */

import {
  CLASE_INTERLETRADO,
  CLASE_INTERLINEADO,
  NIVELES_TIPOGRAFICOS,
  type Nivel,
} from '../../_lib/tipografia'

/**
 * La caja de UN servicio: una pantalla de alto, centrada, a lo ancho.
 *
 * Es la que llevan los tres bloques hermanos de la rama sin coreografía. La
 * rama pinneada NO la reusa desde SITIO-S11: su panel dejó de tener un solo
 * hijo y declara su propio eje en `CLASE_DEL_STICKY`, acá abajo.
 */
export const CLASE_DE_BLOQUE_DE_SERVICIO = 'flex min-h-svh w-full items-center'

/**
 * EL PANEL PINNEADO — la misma pantalla de piso, pegada al tope, EN COLUMNA.
 *
 * `sticky top-0` es todo el pinneado: ni una línea de JavaScript, y por eso
 * sobrevive abajo del umbral de la compuerta — mobile conserva el ritmo gratis.
 * `position: sticky` deja de funcionar en silencio si cualquier ancestro tiene
 * `overflow` distinto de `visible`; la cadena hasta `body` se verificó limpia
 * cuando se escribió `PanelPinneado` y este lane no agrega ninguno.
 *
 * ── Por qué dejó de ser `CLASE_DE_BLOQUE_DE_SERVICIO` con un `sticky` adelante ──
 *
 * Porque el panel pasó de tener UN hijo a tener DOS (SITIO-S11): la cabecera de
 * la sección —el rótulo y el titular que la nombran, defecto 16— y la pila de
 * los tres servicios. Con `flex … items-center` y un solo hijo el eje no se
 * notaba; con dos, `flex` en fila los pondría UNO AL LADO DEL OTRO. Así que el
 * eje se declara —`flex-col`— y el centrado pasa del eje cruzado
 * (`items-center`) al principal (`justify-center`), que es donde ahora vive el
 * centrado vertical. La caja es la misma: `min-h-svh`, a lo ancho, un piso y no
 * un techo.
 */
export const CLASE_DEL_STICKY =
  'sticky top-0 flex min-h-svh w-full flex-col justify-center gap-[var(--spacing-8)]'

/**
 * LA PILA — los TRES servicios en la MISMA celda, uno pintado y dos apagados.
 *
 * ⚠️ **Es el arreglo del defecto 1 de SITIO-S10, mitad de arriba, y la razón por
 * la que existe.** Arriba de 1025 la secuencia montaba `SERVICIOS[indice]`: UNO
 * por vez. Visualmente correcto —así fue diseñada— y para un lector de pantalla
 * catastrófico: `s10-acceso` §4 midió que el árbol pasaba de 26 encabezados a 24
 * y de 43 marcadores anunciados a 33. Quien navega por encabezados sin
 * scrollear no alcanzaba dos tercios de la sección.
 *
 * La pila pone a los tres en el DOM al mismo tiempo y deja que la secuencia
 * elija cuál se PINTA. La secuencia visual no cambia: se sigue viendo uno, y
 * sigue siendo el del tramo activo.
 *
 * ── Por qué es una grilla de UNA celda ────────────────────────────────────
 *
 * Porque las tres capas se declaran en `col-start-1 row-start-1`: la que está
 * en flujo ocupa la celda y las que no —ver las dos formas, acá abajo— no
 * empujan una fila nueva ni aparecen debajo. Sin la grilla, el día que las tres
 * vuelvan a estar en flujo se apilarían una atrás de otra y la sección mediría
 * el triple.
 *
 * ⚠️ **El panel mide la capa PINTADA, no la más alta de las tres**, porque las
 * apagadas salen del flujo. Es a propósito y es lo conservador: es exactamente
 * el alto por tramo que tenía la versión aprobada por grabación, cuando la
 * secuencia montaba un servicio por vez. Medir la más alta habría emparejado el
 * alto entre tramos —probablemente mejor— pero es un cambio de composición, y
 * este sprint arregla defectos.
 */
export const CLASE_DE_LA_PILA = 'grid w-full'

/**
 * LAS DOS FORMAS DE UNA CAPA, Y POR QUÉ EL APAGADO ES `sr-only`.
 *
 * El apagado tiene que sacar la capa de la PANTALLA sin sacarla del ÁRBOL DE
 * ACCESIBILIDAD, que es exactamente lo que el defecto pedía. Eso descarta,
 * una por una, todas las formas habituales de esconder algo:
 *
 *   `display:none` / `hidden`     la saca del árbol. Es el defecto otra vez.
 *   `visibility:hidden`           lo mismo, y además reserva el espacio.
 *   `aria-hidden="true"`          la saca del árbol A PROPÓSITO. Es lo contrario.
 *   `inert`                       la saca del árbol en los navegadores que lo
 *                                 implementan. Tampoco sirve.
 *   `content-visibility:hidden`   la saca del árbol.
 *
 * Quedan dos que SÍ dejan el nodo entero para un lector de pantalla: `opacity:
 * 0` y `sr-only`. **Va `sr-only`, y la razón es medida:** el apagado por opacidad
 * pedía las utilidades `opacity-0` y `opacity-100`, y este lane sólo admite
 * valores del tema — `test:s6-tokens` las rechazó las dos («`opacity-` — 3 en
 * uso, todas de token → obtenido ["opacity-100","opacity-0"]»), porque el tema
 * declara `--opacity-tenue|media|alta|casi` y **ninguna de las dos puntas**. Un
 * token nuevo habría sido tocar `theme-develop.css`, que es superficie
 * compartida y de otro dueño.
 *
 * Y `sr-only` no es el premio consuelo: es **la utilidad que este sistema ya usa
 * para exactamente esto** —la copia que el divisor de líneas deja para que el
 * titular partido se anuncie entero, la misma que `s7-arboles` publica como el
 * delta legítimo entre las dos ramas—. Dice en el marcado lo que la capa es: un
 * contenido para lectores, no para la pantalla.
 *
 * ⚠️ **Es una decisión de CSS que ningún instrumento del banco de S10 puede
 * ver**, y va declarado: `s10-recorrido.ts` lee marcado y no hoja de estilos, así
 * que para él las tres capas están en el árbol —que es la mitad que este arreglo
 * necesita que sea cierta— y ninguna está pintada de más. La otra mitad, que se
 * pinte UNA SOLA, se afirma acá en el lane: `s6-servicios` §10.
 *
 * ── Por qué la forma se declara en un atributo Y en la clase ──────────────
 *
 * La clase es lo que ESCONDE; el atributo `data-capa` es lo que la capa DICE ser.
 * Tenerlos separados permite lo que ninguno de los dos solo permite: cazar la
 * mentira. `capasDeServicio` de `deteccion.ts` sólo cuenta una capa como apagada
 * si dice serlo y además lleva la clase, y como vigente si dice serlo y NO la
 * lleva; cualquier desacuerdo cae en `capasSinDeclararSuForma`, que se afirma
 * vacío. Con la clase sola, una capa a la que le borren el apagado se leería
 * como vigente sin que nadie levante la mano.
 *
 * ⚠️ El acento sigue siendo UNO por cuadro. `--color-acento` cuelga de
 * `[data-servicio]`, que ahora hay tres — pero dos están recortadas a un píxel
 * fuera del flujo, así que en la pantalla nunca hay más de un acento vigente. La
 * propiedad no se perdió: cambió de «un atributo en el marcado» a «una capa
 * pintada», que es lo que siempre quiso decir.
 */
export const CLASE_DE_CAPA_APAGADA = 'sr-only'

/** Lo que una capa DICE ser, en `data-capa`. Ver la nota de arriba. */
export const CAPA_VIGENTE = 'vigente'
export const CAPA_APAGADA = 'apagada'
export type FormaDeCapa = typeof CAPA_VIGENTE | typeof CAPA_APAGADA

/**
 * El lugar de una capa en la pila. Lo lleva SÓLO la vigente: sobre una capa
 * apagada, `w-full` le ganaría el ancho a `sr-only` —Tailwind emite `w-*`
 * después— y quedaría una caja de una pantalla de ancho recortada por
 * `clip-path`, que es esconder algo por accidente y no por declaración.
 */
const CLASE_DE_CAPA = 'col-start-1 row-start-1 w-full'

/** Las clases de una capa de la pila, según se pinte o no. */
export function clasesDeCapa(vigente: boolean): string {
  return vigente ? CLASE_DE_CAPA : CLASE_DE_CAPA_APAGADA
}

/** Lo que la capa declara ser. Tiene que coincidir con lo que la clase hace. */
export function formaDeCapa(vigente: boolean): FormaDeCapa {
  return vigente ? CAPA_VIGENTE : CAPA_APAGADA
}

/**
 * Las clases de un nivel tipográfico, como CADENA.
 *
 * Existe por un motivo estructural y no por comodidad: `CanalDePiezas` emite un
 * `div` contenedor al que solo se le pueden pasar clases —no se puede elegir el
 * elemento— así que el párrafo del canal P3 no puede ser un `<Cuerpo>`. Para
 * que igual mida lo mismo que el resto del sitio, las clases se leen de
 * `NIVELES_TIPOGRAFICOS`, que es la MISMA tabla que consume `<Texto>`. Copiar
 * `text-cuerpo leading-texto tracking-texto` a mano habría sido una cuarta
 * copia de la tabla, capaz de desviarse sola.
 *
 * ⚠️ HALLAZGO REPORTADO: P3 está medido sobre `p` (8 de sus 11 instancias) y acá
 * el párrafo termina siendo un `div`. El arreglo limpio es una propiedad `como`
 * en `Piezas`, que es del sistema de motion y no de este lane.
 */
export function clasesDeNivel(nivel: Nivel): string {
  const definicion = NIVELES_TIPOGRAFICOS[nivel]
  return [
    'font-cuerpo',
    definicion.claseFija,
    CLASE_INTERLINEADO[definicion.interlineado],
    CLASE_INTERLETRADO[definicion.interletrado],
  ].join(' ')
}
