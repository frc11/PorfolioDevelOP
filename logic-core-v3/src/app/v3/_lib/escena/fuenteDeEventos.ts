/**
 * DE DÓNDE SALEN LOS EVENTOS DE PUNTERO DE LA ESCENA (B5).
 *
 * ── ⚠️ SIN ESTO, EL OFFSET DE MOUSE NO EXISTE EN EL HOME ──────────────────
 *
 * Por default `<Canvas>` conecta el sistema de eventos de r3f **a su propio
 * div**, que en el home vive en `z-0` **debajo** de las ocho secciones. Los
 * paneles son `pointer-events: auto` y viven en `z-10`, así que se comen todos
 * los `pointermove` antes de que lleguen al canvas: `document.elementFromPoint`
 * a (24, 450) devuelve la `<section>`, nunca el div de r3f.
 *
 * **Medido, con control positivo.** Con un mouse REAL por CDP, barrer el puntero
 * de un borde al otro movía el centroide de la silueta del logo **0,36 px**;
 * apagando los `pointer-events` del contenido y repitiendo el mismo barrido,
 * **1,77 px**. La única diferencia entre las dos corridas es quién recibe el
 * evento. Con la fuente puesta y el contenido intacto: **2,34 px**.
 *
 * ── ⚠️ Y POR QUÉ LA PRIMERA MEDICIÓN DE B5 DIJO LO CONTRARIO ─────────────
 *
 * Despachar un `PointerEvent` sintético **directamente sobre el div de r3f**
 * daba 2,51 px y parecía confirmar que el offset andaba. El instrumento estaba
 * entregando la única entrada que el producto no puede recibir: es la definición
 * de «verde por arnés», y el discriminador es la pregunta de siempre — **qué
 * parte de la afirmación la puso el propio instrumento**.
 *
 * ── Qué arregla pasar un ANCESTRO ────────────────────────────────────────
 *
 * Un `pointermove` sobre una sección burbujea hasta el `<html>`, así que r3f lo
 * procesa. Y r3f, al ver un `eventSource`, le pone `pointer-events: none` a su
 * propio div — o sea que el canvas deja de ser blanco de eventos, que es lo que
 * corresponde para una capa `aria-hidden` de ornamento.
 *
 * Los listeners de `pointermove` y `wheel` que r3f registra son **pasivos**
 * (`DOM_EVENTS` de `@react-three/fiber` 9.6.1), así que no le pelean el scroll a
 * Lenis ni pueden bloquear un gesto.
 *
 * ── Por qué el `<html>` y no el envoltorio de la escena ──────────────────
 *
 * Porque el envoltorio **no es ancestro de los paneles**: son hermanos, y un
 * evento sobre una sección no burbujearía hasta él. El `<html>` es el único
 * elemento que es ancestro de todo lo que se puede tocar en la página.
 *
 * ── Y por qué `eventPrefix: 'client'` es obligatorio con esto ────────────
 *
 * `offsetX` es relativo a la caja del elemento que RECIBIÓ el evento —una
 * sección cualquiera, un párrafo, un botón— así que daría un puntero que salta
 * según por dónde pasó el mouse. `clientX` es relativo al viewport, que es
 * exactamente el marco de un canvas `fixed inset-0`. Los dos van juntos o
 * ninguno: por eso los devuelve la misma función.
 */

/** Lo que `<Canvas>` necesita para que el puntero le llegue. Los dos juntos. */
export interface FuenteDeEventos {
  readonly eventSource: HTMLElement | undefined
  readonly eventPrefix: 'client'
}

/**
 * El `<html>`, o `undefined` cuando no hay documento.
 *
 * La guarda es por los instrumentos que montan el árbol en Node; en el navegador
 * el módulo que la llama entra por `dynamic(…, { ssr: false })`, así que
 * `document` siempre existe.
 */
export function fuenteDeEventosDelHome(): FuenteDeEventos {
  return {
    eventSource: typeof document === 'undefined' ? undefined : document.documentElement,
    eventPrefix: 'client',
  }
}
