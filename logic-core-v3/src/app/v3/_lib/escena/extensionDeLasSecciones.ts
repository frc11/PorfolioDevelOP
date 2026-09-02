/**
 * LA EXTENSIÓN DE LAS SECCIONES — de dónde a dónde llega el bloque de las ocho,
 * en coordenadas del documento.
 *
 * ── Por qué existe este archivo (V3-B, defecto 3 de §7.46) ─────────────────
 *
 * `EscenaDelHome.tsx` leía `document.documentElement.scrollHeight` y se lo daba
 * al mapeo y a la visibilidad como denominador del recorrido. **El documento
 * mide cosas que no son secciones**, y el anclaje se deriva de la tabla de
 * secciones: las dos cuentas coincidían *mientras* todo lo que sumara alto fuera
 * una de las ocho. §7.46 midió lo que eso costaba —sacar el pie de la
 * `<section id="cierre">` le suma **485 px a 1440 y 746 px a 375** al documento
 * por fuera de la tabla, y con eso el progreso que vale 0,750 donde el
 * diferencial llena el cuadro pasaba a **0,7201 y 0,6906**— y por eso el defecto
 * 6 (el `contentinfo` fuera del `<main>`) estaba frenado: moverlo corría el
 * anclaje sin tocar el anclaje.
 *
 * Con la extensión de las secciones como denominador, **nada que no sea una
 * sección entra en la cuenta** y el defecto 6 se destraba solo.
 *
 * ── La partición: lo puro arriba, el DOM abajo ─────────────────────────────
 *
 * `extensionDe` no sabe qué es un elemento: recibe cajas y devuelve el envolvente
 * o `null`. Es lo que permite que un invariante la corra con cajas fabricadas
 * —vacías, desordenadas, con un hueco— sin un navegador. `medirLasSecciones`
 * es la capa fina que le pide esas cajas a un documento, y el documento entra
 * por parámetro para poder pasarle uno de mentira.
 *
 * ── ⚠️ POR QUÉ `min`/`max` Y NO «la primera y la última» ───────────────────
 *
 * Las ocho secciones son hermanas contiguas y sin separación —está medido: 33
 * de 36 separaciones en 0 px, y ningún panel declara margen— así que hoy la
 * primera del documento es la de más arriba y la última la de más abajo. Tomar
 * el envolvente igual **no cuesta nada y no depende de que eso siga siendo
 * cierto**: si mañana una sección se reordenara con `order` o se sacara del
 * flujo, «la primera del DOM» dejaría de ser «la de más arriba» y el recorrido
 * se calcularía sobre un tramo que no existe, en silencio.
 *
 * ── ⚠️ LA MEDICIÓN ES `getBoundingClientRect`, Y SUS DOS CONDICIONES ───────
 *
 * 1. **Transformaciones.** `CLAUDE.md` documenta que `getBoundingClientRect`
 *    devuelve coordenadas equivocadas sobre un elemento con `transform` activo.
 *    Las `<section>` no llevan ninguno —`Panel.tsx` les emite `relative z-10
 *    w-full` más las clases de su superficie, que son colores— y un `transform`
 *    en un DESCENDIENTE no mueve la caja del ancestro. La condición está
 *    afirmada sobre el fuente de `Panel.tsx` en `s13b-escena.invariant.ts` §3,
 *    con su control positivo: no es una promesa de este comentario.
 * 2. **La pestaña visible.** Con la pestaña ocluida toda medición de layout da
 *    cero (`CLAUDE.md`). Este módulo **no** comprueba `visibilityState`: lo hace
 *    quien llama, antes de leer nada, porque ahí ya se comprueba `innerHeight`
 *    por el mismo motivo y una segunda guarda escondida acá haría creer que el
 *    llamador puede saltearse la suya.
 *
 * ── Lo que este módulo NO decide ───────────────────────────────────────────
 *
 * Qué se hace cuando no hay secciones. Devuelve `null` —no un cero, no el alto
 * del documento— y quien llama decide. Un respaldo escondido acá sería
 * exactamente el defecto que este archivo viene a sacar: volver a mezclar en la
 * cuenta algo que no es una sección, y sin que se note.
 */

/**
 * EL ATRIBUTO CON EL QUE LAS OCHO SE AGARRAN DEL DOM.
 *
 * ⚠ **Lo emite `_componentes/Panel.tsx`, que es de otro directorio**, así que
 * esta constante es una SEGUNDA escritura del mismo nombre y hay que tratarla
 * como tal: `s13b-escena.invariant.ts` §3 lee el fuente de `Panel.tsx` y afirma
 * que la `<section>` sigue emitiendo `data-panel`, con un control positivo que
 * comprueba que el detector sabe decir que no. Sin esa afirmación, renombrar el
 * atributo dejaría la escena sin recorrido **sin un solo error**.
 *
 * Se elige `data-panel` y no `id` porque el `id` es además el ancla de
 * navegación y el destino del enlace de salto: un ancla puede cambiar por una
 * razón de contenido, y el atributo de instrumentación no.
 */
export const ATRIBUTO_DEL_PANEL = 'data-panel'

/** El selector de las ocho. Se arma del atributo, no se escribe dos veces. */
export const SELECTOR_DE_LAS_SECCIONES = `[${ATRIBUTO_DEL_PANEL}]`

/**
 * Un intervalo vertical en coordenadas del DOCUMENTO (no de la ventana): sirve
 * igual para una sección sola y para el envolvente de las ocho.
 */
export interface ExtensionDeLasSecciones {
  /** Dónde empieza, en píxeles desde el borde de arriba del documento. */
  readonly arriba: number
  /** Dónde termina. */
  readonly abajo: number
}

/**
 * EL ENVOLVENTE DE UNAS CAJAS. `null` si no hay ninguna.
 *
 * Puro y sin DOM. Tolera cajas en cualquier orden y con huecos: lo que devuelve
 * es de dónde a dónde llega el conjunto, que es lo que el recorrido recorre.
 *
 * Una caja con un borde que no es un número finito **descarta la medición
 * entera** en vez de contaminar el envolvente: `Math.min` con un `NaN` propaga
 * el `NaN` a todo el recorrido, y un recorrido `NaN` deja la escena clavada sin
 * que nada avise.
 */
export function extensionDe(
  cajas: readonly ExtensionDeLasSecciones[],
): ExtensionDeLasSecciones | null {
  let arriba = Number.POSITIVE_INFINITY
  let abajo = Number.NEGATIVE_INFINITY
  for (const caja of cajas) {
    if (!Number.isFinite(caja.arriba) || !Number.isFinite(caja.abajo)) return null
    if (caja.arriba < arriba) arriba = caja.arriba
    if (caja.abajo > abajo) abajo = caja.abajo
  }
  return arriba <= abajo ? { arriba, abajo } : null
}

/** Lo mínimo de un elemento que esta medición necesita. */
export interface CajaMedible {
  getBoundingClientRect(): { readonly top: number; readonly bottom: number }
}

/** Lo mínimo de un documento que esta medición necesita. */
export interface FuenteDeLasSecciones {
  querySelectorAll(selector: string): ArrayLike<CajaMedible>
}

/**
 * LA EXTENSIÓN DE LAS SECCIONES DE UN DOCUMENTO, en coordenadas del documento.
 *
 * `getBoundingClientRect` es relativo a la ventana, así que se le suma el
 * `scrollY` **de la misma lectura** que el llamador ya hizo. Pasarlo por
 * parámetro y no leerlo acá no es una manía: si este módulo leyera `window.
 * scrollY` por su cuenta, la posición y la extensión podrían venir de dos
 * cuadros distintos y el progreso saltaría un píxel sin causa visible.
 */
export function medirLasSecciones(
  documento: FuenteDeLasSecciones,
  scrollY: number,
): ExtensionDeLasSecciones | null {
  const nodos = documento.querySelectorAll(SELECTOR_DE_LAS_SECCIONES)
  const cajas: ExtensionDeLasSecciones[] = []
  for (let i = 0; i < nodos.length; i += 1) {
    const caja = nodos[i].getBoundingClientRect()
    cajas.push({ arriba: caja.top + scrollY, abajo: caja.bottom + scrollY })
  }
  return extensionDe(cajas)
}
