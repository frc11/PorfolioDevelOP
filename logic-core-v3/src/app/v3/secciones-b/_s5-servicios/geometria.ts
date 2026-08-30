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
 * Es la que llevan los tres bloques hermanos de la rama sin coreografía, y es
 * la mitad de la que lleva el `sticky` de la rama pinneada.
 */
export const CLASE_DE_BLOQUE_DE_SERVICIO = 'flex min-h-svh w-full items-center'

/**
 * La misma caja, pegada al tope.
 *
 * `sticky top-0` es todo el pinneado: ni una línea de JavaScript, y por eso
 * sobrevive abajo del umbral de la compuerta — mobile conserva el ritmo gratis.
 * `position: sticky` deja de funcionar en silencio si cualquier ancestro tiene
 * `overflow` distinto de `visible`; la cadena hasta `body` se verificó limpia
 * cuando se escribió `PanelPinneado` y este lane no agrega ninguno.
 */
export const CLASE_DEL_STICKY = `sticky top-0 ${CLASE_DE_BLOQUE_DE_SERVICIO}`

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
