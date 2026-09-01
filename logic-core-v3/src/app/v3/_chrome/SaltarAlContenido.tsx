import { ID_DE_LA_SECCION_DE_ENTRADA } from '../_componentes/Panel'

/**
 * EL ENLACE DE SALTO — la primera parada del documento, y la única que existe
 * para dejar de usarse.
 *
 * ── El defecto que cierra, con su medición ─────────────────────────────────
 *
 * `s10-acceso` §2 y §3 midieron el orden de tabulación del home entero y
 * publicaron dos hallazgos que son el mismo problema visto de dos lados:
 *
 *   · **hallazgo 1 (media)** — las paradas **1 a 5 de 15** son la pastilla de
 *     navegación, que nace a `100svh − 72px`, o sea al **89,2 % / 91,5 % /
 *     92,0 %** de la primera pantalla según el alto declarado (595 / 772 / 828
 *     px). Quien tabula la encuentra PRIMERO y la ve ABAJO de todo el Hero:
 *     orden de foco y orden visual no coinciden (WCAG 2.4.3);
 *   · **hallazgo 2 (media)** — no hay enlace «saltar al contenido»: son cinco
 *     paradas de navegación antes de la primera del contenido, **en las dos
 *     ramas**.
 *
 * ⚠ **La pastilla no se mueve, y no es pereza.** Su posición en el documento es
 * lo que define dónde NACE —`contrato.ts` lo escribe con la cuenta— y su
 * geometría está medida y aprobada por grabación arriba de 1025. Bajarla en el
 * documento para «arreglar» el orden de foco arreglaría la lista de paradas
 * rompiendo la pastilla, que es peor. La salida correcta para «la navegación va
 * primero» es la que la web usa desde hace veinte años: **un escape al principio
 * de todo**, que en una sola pulsación deja las cinco atrás.
 *
 * ── Por qué el destino es la SECCIÓN DE ENTRADA y no el `<main>` ───────────
 *
 * Porque el `<main>` de `v3/layout.tsx` **empieza ANTES que la pastilla** —el
 * chrome es su primer hijo, por la geometría de arriba— así que un salto al
 * `<main>` aterrizaría *antes* de los cinco enlaces y no saltearía nada: el
 * enlace parecería andar y no andaría. El destino tiene que ser el primer
 * elemento que está DESPUÉS del chrome, y ése es el ancla de la primera sección
 * de la tabla. `ID_DE_LA_SECCION_DE_ENTRADA` lo deriva de ahí; este archivo no
 * escribe un id ni un `#`.
 *
 * Queda declarado el día que se cierre el hallazgo 7 —`navigation` anidado en
 * `main`—: cuando la pastilla viva afuera del `<main>`, el destino natural pasa
 * a ser el `<main>` y esta constante cambia de valor, no de forma.
 *
 * ── Cómo se ve, y por qué NO es `display: none` ────────────────────────────
 *
 * Un `display: none` lo saca del orden de foco: sería un enlace que no se puede
 * enfocar, o sea ninguno. La regla vive en `_estilos/foco.css` y hace lo
 * contrario: lo saca DE CUADRO —`position: absolute` con la caja recortada— y lo
 * trae con `:focus-visible`. Las dos mitades importan:
 *
 *   · **fuera del flujo, siempre.** Si esto midiera un solo píxel de alto en el
 *     flujo, empujaría a la pastilla hacia abajo y le movería el nacimiento —que
 *     es la cuenta que `s8-chrome` §2 custodia contra el Hero real—. Por eso la
 *     hoja lo declara `absolute` en reposo y `fixed` cuando se ve, y por eso
 *     `s8-chrome` lo afirma leyendo la hoja y no confiando en el marcado;
 *   · **visible de verdad al enfocarlo**, con superficie opaca propia: al ser
 *     `fixed` flota sobre lo que haya detrás, y `--color-fondo` sobre
 *     `--color-tinta` da 17,60:1. No hereda la superficie de ninguna sección
 *     porque no vive adentro de ninguna: cuelga de `[data-v3]`, arriba de las
 *     ocho.
 *
 * El anillo de foco no lo pone este archivo: lo pone la regla única de
 * `theme-develop.css` acotada a `[data-v3]`, igual que a las otras 15 paradas.
 */

/**
 * El rótulo. Es copy del CHROME, no contenido de una sección: no sale de ningún
 * `contenido.ts` ni lleva marcador, porque no hay nada que inventar acá — es la
 * frase que este patrón usa en castellano y describe exactamente lo que hace.
 * Se exporta para que el instrumento lo afirme sin escribirlo de nuevo.
 */
export const ROTULO_DEL_SALTO = 'Saltar al contenido'

export function SaltarAlContenido(): React.JSX.Element {
  return (
    <a
      data-pieza="salto"
      href={`#${ID_DE_LA_SECCION_DE_ENTRADA}`}
      className="text-cuerpo tracking-texto leading-texto font-semi"
    >
      {ROTULO_DEL_SALTO}
    </a>
  )
}
