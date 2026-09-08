/**
 * LOS DETECTORES DE ACCESIBILIDAD DE SITIO-S10 — puros, y con su entrada rota
 * al lado.
 *
 * ⚠ **ESTE ARCHIVO NO SE ESCANEA POR TOKENS.** No emite marcado, no declara un
 * color y no pinta nada: son funciones que LEEN marcado ya renderizado. Los
 * hex que aparecen en `s10-acceso-color.ts` se leen del tema; acá no hay
 * ninguno. El padrón de tokens del sprint no tiene nada que mirar acá, y
 * decirlo evita que un escáner futuro lo agregue a su corpus por el nombre.
 *
 * ── Por qué los detectores viven separados del invariante ─────────────────
 *
 * Por el control positivo. La regla del sprint es que ninguna comprobación
 * quede verde por vacío, y la única forma de probar que un detector VE el
 * defecto es correr **la misma función** contra una entrada fabricada rota. Si
 * el detector estuviera escrito adentro del invariante, el control tendría que
 * reimplementarlo, y un control que reimplementa lo que prueba no prueba nada.
 *
 * Por eso cada detector de acá tiene su entrada rota en `ROTOS`, escrita a
 * mano y con el defecto adentro.
 *
 * ── Lo que estos detectores NO pueden ver, y va declarado ─────────────────
 *
 *   · **el CSS.** Un `display:none`, un `sr-only`, un `order` o un `position`
 *     no existen para un lector de marcado. Lo que dependa de eso se publica
 *     como supuesto, nunca como resultado;
 *   · **el árbol de accesibilidad de verdad.** Acá se modela la regla de
 *     `aria-hidden` —que es la que este home usa— y nada más. Un `role` que
 *     cambie el nombre accesible, un `aria-owns` o un `<title>` de SVG no
 *     entran en el modelo, y el home no usa ninguno de los tres.
 */

import { atributo, nodosDe, textoDe } from './s10-recorrido'
import type { Parada } from './s10-lectura'
import { textoAnunciado } from './s10-acceso-anunciado'

/**
 * ── ⚠️ LA PUERTA SIGUE SIENDO ÉSTA (B7) ───────────────────────────────────
 *
 * El arreglo del censo de marcadores cruzaba este archivo las 300 líneas del
 * repo, así que **el texto anunciado y su censo se mudaron** a
 * `./s10-acceso-anunciado`, con el corte por tema: allá está *qué se anuncia*,
 * acá los detectores que leen el árbol de accesibilidad. Lo que este archivo
 * exportaba, lo sigue exportando —`s10-acceso-tablas.ts` y
 * `s10-acceso-landmarks.ts` importan de acá y no cambiaron un import—, y por eso
 * la reexportación es explícita en vez de una estrella: quien lea esta lista ve
 * exactamente qué sale por esta puerta.
 */
export {
  documentoAnunciado,
  enmascararOcultos,
  marcadoresAnunciados,
  marcadoresAnunciadosSoloHojas,
  textoAnunciado,
  FORMAS_DEL_CENSO,
  type MarcadorAnunciado,
} from './s10-acceso-anunciado'

// ── La duplicación del rollover y del divisor de líneas ─────────────────────

/**
 * Si un texto es exactamente su propia mitad repetida — con o sin espacio en el
 * medio.
 *
 * Las dos formas hacen falta y salen de dos defectos distintos y reales: el
 * rollover de la referencia pega las dos copias **sin separador**
 * (`"…PomeloExplore…"`, documentado en `Cta.tsx`), y el divisor de líneas
 * separa la copia accesible de las piezas con espacio en blanco del marcado.
 * Un detector que mirara sólo una de las dos dejaría pasar la otra.
 */
export function esRepeticionExacta(texto: string): boolean {
  const t = texto.trim().replace(/\s+/g, ' ')
  if (t.length < 2) return false
  const conEspacio = t.length % 2 === 1 && t[(t.length - 1) / 2] === ' '
  if (conEspacio) {
    const mitad = (t.length - 1) / 2
    return t.slice(0, mitad) === t.slice(mitad + 1)
  }
  if (t.length % 2 !== 0) return false
  return t.slice(0, t.length / 2) === t.slice(t.length / 2)
}

// ── Los landmarks DE VERDAD ─────────────────────────────────────────────────

/**
 * Los ocho roles de landmark de ARIA. **Ser un rol no es ser un landmark**, y
 * confundirlo infla la cuenta: este home pone `role="img"` en cuatro `<figure>`
 * —que es correcto y no tiene nada que ver con la navegación por regiones— y un
 * filtro por «tiene rol» los cuenta como landmarks.
 *
 * `search` entra en la lista aunque este home no lo use: la lista es la de
 * ARIA, no la de lo que el home tiene hoy.
 */
export const ROLES_DE_LANDMARK: ReadonlySet<string> = new Set([
  'banner',
  'complementary',
  'contentinfo',
  'form',
  'main',
  'navigation',
  'region',
  'search',
])

/** Si un rol —implícito o explícito— es de landmark. */
export function esRolDeLandmark(rol: string | null): boolean {
  return rol !== null && ROLES_DE_LANDMARK.has(rol)
}

// ── El rótulo accesible de una parada de tabulación ─────────────────────────

export type ViaDelRotulo = 'aria-label' | 'aria-labelledby' | 'label[for]' | 'contenido' | 'ninguna'

export interface RotuloDeParada {
  readonly rotulo: string
  readonly via: ViaDelRotulo
}

/**
 * El rótulo accesible de una parada, con la vía por la que se calculó.
 *
 * ⚠ **Resuelve `<label for>`, que es la mitad que falta.** Un `<input>` es un
 * elemento vacío: no tiene contenido, así que cualquier lector que calcule el
 * rótulo como «`aria-label` o el texto de adentro» le devuelve la cadena vacía
 * y lo publica como un control sin nombre. Este home tiene exactamente un
 * `<input>` y **sí** tiene su `<label for>`; sin esta resolución, el reporte
 * publicaría un defecto que no existe.
 *
 * El orden es el de la especificación de nombre accesible, acotado a lo que
 * este documento usa: `aria-labelledby` → `aria-label` → `<label for>` →
 * contenido.
 */
export function rotuloDeParada(html: string, parada: Parada): RotuloDeParada {
  const nodos = nodosDe(html)
  const porId = (id: string): string | null => {
    const objetivo = nodos.find((n) => atributo(n, 'id') === id)
    return objetivo === undefined ? null : textoAnunciado(html, objetivo)
  }

  const etiquetado = atributo(parada.nodo, 'aria-labelledby')
  if (etiquetado !== null) {
    const texto = porId(etiquetado)
    if (texto !== null && texto !== '') return { rotulo: texto, via: 'aria-labelledby' }
  }

  const propio = atributo(parada.nodo, 'aria-label')
  if (propio !== null && propio !== '') return { rotulo: propio, via: 'aria-label' }

  const id = atributo(parada.nodo, 'id')
  if (id !== null) {
    const etiqueta = nodos.find((n) => n.etiqueta === 'label' && atributo(n, 'for') === id)
    if (etiqueta !== undefined) {
      const texto = textoAnunciado(html, etiqueta)
      if (texto !== '') return { rotulo: texto, via: 'label[for]' }
    }
  }

  const contenido = textoAnunciado(html, parada.nodo)
  return contenido === ''
    ? { rotulo: '', via: 'ninguna' }
    : { rotulo: contenido, via: 'contenido' }
}

// ── El movimiento, leído del marcado ────────────────────────────────────────

/** Los elementos con una transformada escrita en su `style`. */
export function transformadasDe(html: string): string[] {
  return nodosDe(html)
    .map((n) => atributo(n, 'style'))
    .filter((v): v is string => v !== null && /(^|;)\s*transform:/.test(v))
}

/** Los elementos que declaran `will-change`, por estilo o por utilidad. */
export function willChangeDe(html: string): string[] {
  return nodosDe(html)
    .filter(
      (n) =>
        /will-change/.test(atributo(n, 'style') ?? '') ||
        /(^|\s)will-change-/.test(atributo(n, 'class') ?? ''),
    )
    .map((n) => `${n.etiqueta}.${atributo(n, 'class') ?? ''}`)
}

/** Las piezas del divisor de líneas — el texto partido palabra por palabra. */
export function piezasDelDivisor(html: string): string[] {
  return nodosDe(html)
    .filter((n) => atributo(n, 'data-lineas-piezas') !== null)
    .map((n) => textoDe(html, n))
}

// ── LAS ENTRADAS FABRICADAS ROTAS ───────────────────────────────────────────

/**
 * Cada una lleva **un solo defecto**, y es el que su detector tiene que ver.
 * Con dos defectos adentro un control positivo pasa por el que no está
 * mirando, y vuelve a ser verde por vacío con otro traje.
 */
export const ROTOS = {
  /** La segunda copia del CTA SIN `aria-hidden`: se anuncia dos veces, pegada. */
  ctaSinOcultar:
    '<a href="#x"><span data-parte="ventana"><span data-parte="copia-a">Ver los servicios</span><span data-parte="copia-b">Ver los servicios</span></span></a>',
  /** El divisor con la copia accesible Y las piezas visibles en el árbol. */
  divisorSinOcultar:
    '<h2><div><span class="sr-only">Lo que sigue</span><span data-lineas-piezas=""><span>Lo</span> <span>que</span> <span>sigue</span></span></div></h2>',
  /** Un salto de nivel: `h2` y después `h4`. */
  saltoDeNivel: '<main><h2>Uno</h2><h4>Dos</h4></main>',
  /** Un `tabindex` positivo, que rompe el orden del documento. */
  tabindexPositivo: '<main><a href="#a">A</a><a href="#b" tabindex="3">B</a></main>',
  /** Un documento sin `<main>`: el defecto de cinco de las seis URLs de la referencia. */
  sinMain: '<div data-v3=""><section id="x"><h1>Hola</h1></section></div>',
  /** Un `<input>` sin `<label for>` ni `aria-label`: control sin nombre. */
  campoSinRotulo: '<form><label for="otro">Tu correo</label><input id="campo" type="email"/></form>',
  /** Un `<figure role="img">`, que NO es un landmark aunque tenga rol. */
  rolQueNoEsLandmark: 'img',
  /** Una transformada escrita en el marcado. */
  conTransformada: '<div style="transform:translate(0%, 60%)">x</div>',
  /** Un `will-change` por utilidad de Tailwind. */
  conWillChange: '<div class="will-change-transform">x</div>',
} as const
