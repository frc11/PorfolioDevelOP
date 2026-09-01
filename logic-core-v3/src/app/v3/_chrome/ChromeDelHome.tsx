import { CursorCompuerta } from '../_componentes/chrome/CursorCompuerta'
import { Navegacion } from '../_componentes/chrome/Navegacion'

import { CURSOR_PROPIO_EN_EL_HOME } from './contrato'
import { SaltarAlContenido } from './SaltarAlContenido'

/**
 * EL CHROME DEL HOME — la pastilla que viaja, y el cursor detrás de su decisión.
 *
 * ── Qué monta, y qué NO monta porque ya estaba montado ─────────────────────
 *
 * La instrucción de SITIO-S8 dice que S7 «no montó el chrome». **Es media
 * verdad**, y trabajar sobre la premisa equivocada llevaría a construir de nuevo
 * cosas que existen:
 *
 *   · **la pastilla SÍ estaba montada** — vivía en `/v3/page.tsx` desde S7, y la
 *     Fase 0 de este sprint la mudó acá sin cambiarle una línea. Lo que este
 *     frente hace con ella no es montarla: es VERIFICAR que su umbral —derivado
 *     de tokens en `_lib/navegacion.ts`— sigue valiendo contra el Hero real, y
 *     que la cadena de ancestros sigue sin un `overflow` recortado;
 *   · **el pie SÍ estaba montado** — vive adentro de la sección Cierre, que es
 *     donde lo puso el sprint que la construyó. Lo que este frente hace con él
 *     es completar su recorrido, que enlazaba cuatro secciones de ocho;
 *   · **el cursor propio NO estaba montado**, y §7.23 lo dice con esas palabras.
 *     Es lo único que este archivo agrega, y entra APAGADO.
 *
 * ── ⚠️ POR QUÉ ESTO DEVUELVE UN FRAGMENTO Y NO UN `<div>` ──────────────────
 *
 * **Es la condición de la que depende que la pastilla viaje**, y falla en
 * silencio si se rompe. Es el mismo defecto que `_contrato/Seccion.tsx` documenta
 * para el pinneo, con otra cara:
 *
 * El envoltorio de la pastilla es `position: sticky` con `block-size: 0`, y un
 * elemento `sticky` se pega **dentro de su contenedor de bloque**. Su rango de
 * pegado es `alto del contenedor − alto propio`. Si acá hubiera un `<div>`
 * envolviendo a `Navegacion`, ese `div` mediría lo que mide su contenido —CERO,
 * porque el envoltorio declara `block-size: 0`— y el rango de pegado sería
 * **cero**: la pastilla no se pegaría nunca y se iría con el scroll como
 * cualquier elemento del flujo.
 *
 * Con el fragmento, el contenedor de bloque de la pastilla es el `<main>` del
 * layout de /v3, que mide lo que miden las ocho secciones. Ése es el rango que
 * hace falta. `s8-chrome.invariant.ts` lo afirma sobre el marcado renderizado:
 * el envoltorio de la pastilla es hijo DIRECTO del fragmento, sin un `<div>` que
 * lo envuelva.
 *
 * ⚠ **SITIO-S11 le puso un hermano ANTES, y la afirmación se hizo más fina en
 * vez de aflojarse.** El enlace de salto se emite primero —tiene que ser la
 * primera parada del documento—, así que «el primer elemento es la pastilla»
 * dejó de ser cierto. Lo que sostiene el mecanismo nunca fue el ORDEN sino dos
 * propiedades distintas, y ahora se afirman las dos por separado: que nada
 * ENVUELVE al envoltorio —eso lo dice el marcado— y que lo que lo precede está
 * **fuera del flujo** —eso lo dice la hoja: `[data-pieza="salto"]` es
 * `position: absolute`, y si ocupara un solo píxel de alto le correría el
 * nacimiento a la pastilla—.
 *
 * ── Por qué se monta PRIMERO en el documento ───────────────────────────────
 *
 * Por geometría, no por orden de lectura, y el porqué completo está en
 * `contrato.ts` y en el docblock de `page.tsx`. En una línea: la pastilla vive
 * `absolute` a `top: 100svh − 72px` **dentro de un envoltorio que mide cero**, y
 * la posición de ese envoltorio en el documento es la que define dónde NACE. Si
 * nace tarde, nace abajo. Como mide cero, ponerlo arriba de todo no cuesta un
 * píxel de layout.
 *
 * ── Es un componente de SERVIDOR ───────────────────────────────────────────
 *
 * No lleva `'use client'`, y no hace falta: `Navegacion` es marcado y clases —no
 * tiene un hook ni un listener— y `CursorCompuerta` trae su propio `'use client'`.
 * Referenciar un componente de cliente desde el servidor es exactamente lo que el
 * modelo espera.
 *
 * ── El chrome abajo de 1025 ────────────────────────────────────────────────
 *
 * La regla es que **nada del chrome se monta abajo de 1025 salvo lo que ya está
 * gateado por su cuenta**, y las dos piezas de acá la cumplen por caminos
 * distintos:
 *
 *   · **la pastilla es la excepción declarada, y no es una concesión**: es CSS
 *     `sticky` puro. No baja un byte de JavaScript de más —este archivo no
 *     importa una sola línea del sistema de motion ni del de coreografía— y
 *     funciona igual en los dos lados del umbral. Un mecanismo que no cuesta
 *     nada en mobile no necesita una compuerta que lo apague;
 *   · **el cursor trae las suyas desde S3**, dos y de MONTAJE: abajo de 1025
 *     devuelve `null`, y con `prefers-reduced-motion` también. Con `null` el
 *     `import()` perezoso no se ejecuta y el chunk no se pide. No se construye
 *     otra compuerta acá: se reusa la que existe.
 */
export function ChromeDelHome(): React.JSX.Element {
  return (
    <>
      {/**
       * ⚠️ **VA PRIMERO, Y NO LE MUEVE UN PÍXEL A LA PASTILLA.**
       *
       * Es la única forma de que sea la PRIMERA parada de tabulación del
       * documento: el chrome ya es el primer hijo del `<main>` por geometría, y
       * adentro del chrome esto va antes que la pastilla. Con eso las cinco
       * paradas de la pastilla dejan de ser el único camino hacia el contenido —
       * el defecto que `s10-acceso` §2 y §3 publicaron como hallazgos 1 y 2.
       *
       * Y no compite con el nacimiento de la pastilla porque **está fuera del
       * flujo**: `_estilos/foco.css` lo declara `position: absolute` en reposo y
       * `fixed` al enfocarlo, así que no ocupa alto y el envoltorio `sticky`
       * sigue naciendo exactamente donde nacía. Eso NO se puede ver en el
       * marcado —es CSS— y por eso `s8-chrome` §1 lo afirma leyendo la hoja.
       */}
      <SaltarAlContenido />

      {/**
       * Los enlaces son los de `ENLACES_DE_MUESTRA`, que es el default de la
       * pieza. **No se le pasa una lista propia**, y es deliberado: el menú del
       * sitio es CONTENIDO y nadie lo escribió todavía. Los cinco destinos de la
       * muestra apuntan a anclas que EXISTEN en las ocho, así que ninguno lleva
       * a la nada — y el instrumento lo afirma contra la tabla del recorrido, no
       * contra una lista escrita al lado.
       */}
      <Navegacion />

      {/**
       * ⚠️ **LA DECISIÓN QUE NADIE TOMÓ, MONTADA APAGADA.**
       *
       * `CURSOR_PROPIO_EN_EL_HOME` vive en `contrato.ts`, lo escribió el agente
       * principal y **este frente no la prende**. Lo que este archivo agrega es
       * el punto de montaje: el día que la decisión se tome es una línea, y
       * mientras tanto la diferencia entre «no hay cursor porque nadie escribió
       * el componente» y «no hay cursor porque se decidió que no» queda
       * ESCRITA. En pantalla las dos se ven igual; acá no.
       *
       * Es la tercera condición, arriba de las dos de S3, y es de otra
       * naturaleza: las de S3 preguntan si el cursor CORRESPONDE en este
       * dispositivo; ésta pregunta si el home lo lleva.
       */}
      {CURSOR_PROPIO_EN_EL_HOME ? <CursorCompuerta /> : null}
    </>
  )
}
