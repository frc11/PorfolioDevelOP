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
 * ── ✅ MEDIDO (B7 · frente B) — el rango del pin, y lo que cuesta el piso ──
 *
 * Este bloque decía *«DECLARADO, NO MEDIDO: el rango del pin es `alto de la
 * sección − alto del sticky` … Nadie lo miró todavía. Es la primera cosa a mirar
 * cuando alguien abra la página.»* Se miró, con scroll REAL —paso de 120 px— y
 * los dos bordes afinados por bisección a 2 px:
 * `npx tsx scripts-b7/b-pin.ts` → `docs/rediseno/outputs/b7/b-pin.json`. Las
 * cifras se tomaron contra el **build de producción** (`B7_ORIGEN` en el 3005,
 * que no se recarga) y se reprodujeron al píxel y al `scrollY` contra el dev del
 * 3002 en una corrida limpia; el origen queda escrito en el propio JSON.
 *
 * ⚠️ **LA TABLA SEPARA LO MEDIDO DE LO DERIVADO, columna por columna.** No es
 * pedantería: la primera versión de este bloque mezcló las dos en la misma fila
 * y publicó como «recorrido medido» un `contenedor − hijo` leído con el scroll
 * en cero. A 1920 y 1440 los dos números coinciden dentro de la bisección y la
 * mezcla no se nota; a 1025 difieren en 27,45 px, que es el hijo creciendo.
 *
 *     perfil      hijo @scrollY 0   hijo DURANTE el pin   contenedor
 *     1920×1080       1080                1080              3240
 *     1440×900         900                 900              2700
 *     1025×768       774,55              798,55             2304
 *     1024×768      abajo de la compuerta la rama apilada no monta ningún `sticky`
 *
 *     perfil      rango MEDIDO (bisección)   pegado entre        desborde MEDIDO
 *     1920×1080        2158 px              11.882 → 14.040          0 px
 *     1440×900         1798 px               9.902 → 11.700          0 px
 *     1025×768         1502 px               8.451 →  9.953       30,55 px
 *
 * A 1920 y a 1440 el rango medido es `alto − viewport` menos los 2 px de la
 * bisección, o sea las dos pantallas que declara `ANCLA_DEL_PIN`, y el
 * contenedor mide los tres pasos al píxel.
 *
 * ⚠️ **A 1025×768 el contenido SÍ se pasa de una pantalla, y se pasa por 30,55
 * px.** Es el caso que la advertencia describía. El pin recorre **1.502 px
 * medidos** en vez de los 1.536 derivados de la tabla —**pierde 34 px, el
 * 2,21 % de su recorrido**— y la secuencia termina eso antes.
 *
 * ⚠️ **Y el hijo NO mide lo mismo durante todo el pin: crece de 774,55 a 798,55
 * px a mitad del recorrido**, porque la secuencia cambia de servicio y los tres
 * no tienen el mismo alto. Un censo leído a `scrollY = 0` publica 6,55 px de
 * desborde donde la medición durante el pin da 30,55: **casi cinco veces**. La
 * regla que sale de eso —una altura que puede cambiar durante el recorrido se
 * mide durante el recorrido— está escrita en `scripts-b7/b-pin-lectores.ts`.
 *
 * **No se arregló**: achicar la cabecera o el `gap` es un cambio de composición
 * y este bloque cierra defectos. Queda medido, con su instrumento, y reportado.
 * Lo que `s6-pin.ts` afirma no es «el contenido entra en una pantalla» —esto es
 * un PISO, y nunca se prometió eso— sino la identidad entre lo que el hijo
 * desborda y lo que el pin pierde, **medidas por caminos distintos**: la primera
 * leyendo cajas parada por parada, la segunda moviendo el scroll.
 *
 * ── ⚠️ Y HAY UN SEGUNDO `sticky` ARRIBA DE ÉSTE, QUE ES INERTE ────────────
 *
 * `Seccion.tsx` envuelve a una sección `pinneada: 'siempre'` en un `div` con
 * `w-full sticky top-0 min-h-svh`, y adentro `Servicios.tsx` pone su `Bloque`
 * con el alto de la sección ENTERA. Ese envoltorio **mide lo mismo que su
 * padre** y su rango de pegado es **cero por construcción**: 3240 de 3240 a
 * 1920, 2700 de 2700 a 1440, 2304 de 2304 a 1025, 2370,44 de 2370,44 a 1024.
 * En todos los perfiles y para siempre. **No está roto: nunca tuvo recorrido.**
 *
 * **Cómo se discrimina —y hace falta decirlo, porque esto ya engañó a un
 * instrumento con Fase 0 y controles positivos—:** un `sticky` son DOS
 * elementos, el hijo que se pega y el padre que le da recorrido, y el recorrido
 * disponible es `alto del padre − alto propio`. Mirar sólo la posición del hijo
 * devuelve el MISMO cero en los dos casos: el que está roto y el que nunca tuvo
 * recorrido. B4-B midió el envoltorio y publicó «el pin de `servicios` NO pinea
 * en ningún perfil, ni siquiera a 1920 — 0 paradas pegado de 243»; el pin
 * andaba, y anda byte por byte igual desde B1 (`git diff 8ab34b36 HEAD --
 * servicios/geometria.ts servicios/Servicios.tsx` devuelve vacío). **La cifra
 * que discrimina es el recorrido disponible, y va SIEMPRE al lado del cero.**
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
 * `sticky top-0` es todo el pinneado: ni una línea de JavaScript, así que el
 * MECANISMO no depende de que baje un bundle.
 *
 * ⚠️ **Lo que este bloque decía y hay que corregir:** *«y por eso sobrevive abajo
 * del umbral de la compuerta — mobile conserva el ritmo gratis»*. **Es falso
 * para esta clase, y está medido.** El mecanismo cruza el umbral; ESTA clase no,
 * porque la monta `PanelDeSecuencia` y esa pieza sólo existe en la rama
 * coreografiada. A 1024 el barrido de `scripts-b7/b-pin.ts` encuentra 2
 * elementos `sticky` en todo el documento y **ninguno es este** —la rama apilada
 * no monta pin— mientras que a 1025, 1440 y 1920 encuentra 4 y éste recorre 1.502 px medidos,
 * 1.800 y 2.160 px. Abajo del umbral el ritmo del pinneado no se conserva: no hay pin.
 *
 * `position: sticky` deja de funcionar en silencio si cualquier ancestro tiene
 * `overflow` distinto de `visible`; la cadena hasta `body` se verificó limpia
 * cuando se escribió `PanelPinneado`, este lane no agrega ninguno, y ahora
 * además está medido en el navegador: `ancestroQueRecorta` es `null` para este
 * elemento en los tres perfiles donde se monta (el arnés del barrido prueba que
 * ese campo SÍ detecta un ancestro que recorta cuando lo hay).
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
 *
 * ⚠️ **ÉSTE es el `sticky` que pinea** —el otro, el del envoltorio de
 * `Seccion`, es inerte; ver el docblock del archivo— y por eso
 * `scripts-b7/b-pin.ts` **deriva de esta constante** la huella del elemento que
 * busca en el DOM, en vez de escribirla. Si alguien le cambia una clase, el
 * instrumento no encuentra el elemento y **falla**, en lugar de medir cero y
 * llamarlo defecto: es exactamente el modo de falla que B7 vino a cerrar.
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
