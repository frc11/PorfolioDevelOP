/**
 * EL TEXTO QUE UN LECTOR ANUNCIA — y el censo de marcadores que sale de ahí.
 *
 * ── Por qué esto salió de `s10-acceso.ts` (B7) ─────────────────────────────
 *
 * Porque el arreglo del censo cruzaba ese archivo las 300 líneas del repo, y el
 * corte es por tema, no por tamaño: allá quedaron los detectores que leen el
 * ÁRBOL DE ACCESIBILIDAD —la repetición del rollover, los roles de landmark, el
 * rótulo de una parada, el movimiento escrito en el marcado—, y acá está la capa
 * de la que todos cuelgan: **qué se anuncia**, y el censo de lo que se anuncia
 * PEDIDO. `s10-acceso.ts` sigue siendo la puerta: reexporta todo lo de acá, así
 * que ningún consumidor de afuera cambió un import.
 *
 * ── ⚠️ EL PUNTO CIEGO QUE B7 ARREGLÓ, Y CÓMO SE VEÍA ──────────────────────
 *
 * El censo de antes recorría los nodos y se salteaba **todo nodo cuyo subárbol
 * contuviera otra etiqueta**:
 *
 *     if (enmascarado.slice(nodo.desde, nodo.hasta).includes('<')) continue
 *
 * La intención era no contar dos veces —un marcador adentro de un hijo se
 * contaría en el padre y en el hijo—, y por eso miraba sólo hojas. El costo era
 * silencioso: **un nodo con una etiqueta adentro Y texto propio perdía su
 * texto**. Lo destapó el montaje del pie, que hizo caer el censo de 40 a 37
 * marcadores anunciados con el texto entero en pantalla. B4-A lo sorteó
 * poniendo la continuación del pie en su propia hoja y dejó el detector como
 * estaba, declarándolo de otro sprint. Éste es ese sprint.
 *
 * ── El arreglo: dueño por carácter, no «hoja o nada» ──────────────────────
 *
 * La pregunta correcta no es «¿este nodo es una hoja?» sino «¿de quién es ESTE
 * carácter?». Cada posición del marcado pertenece a **un solo** elemento: el más
 * profundo que la contiene. Con eso un marcador se cuenta exactamente una vez
 * —ni cero ni dos— y se atribuye a quien de verdad lo tiene, tenga hijos o no.
 *
 * La no-duplicación deja de ser una heurística sobre la forma del subárbol y
 * pasa a ser una propiedad de la construcción: carácter → dueño es una función,
 * así que ningún carácter tiene dos dueños.
 *
 * ⚠️ Los dos controles positivos viven en `s10-acceso-censo.ts` §1-bis y usan
 * `marcadoresAnunciadosSoloHojas`, el censo de antes, conservado abajo **sólo
 * para eso**: sin él, «el detector nuevo cuenta 1» no se distingue de «el viejo
 * también contaba 1».
 */

import { nodosDe, textoDe, type Nodo } from './s10-recorrido'

// ── El texto que un lector ANUNCIA ──────────────────────────────────────────

const mascaras = new Map<string, string>()

/**
 * El marcado con el contenido de todo subárbol `aria-hidden="true"` reemplazado
 * por espacios **de la misma longitud**.
 *
 * Los espacios y no un borrado: así todos los offsets de `nodosDe` siguen
 * valiendo sobre la cadena enmascarada, y `textoDe` se puede usar tal cual para
 * cualquier nodo. Borrar movería cada offset posterior y habría que mantener
 * un segundo mapa de posiciones, que es una fuente de error por nada.
 */
export function enmascararOcultos(html: string): string {
  const guardado = mascaras.get(html)
  if (guardado !== undefined) return guardado
  const caracteres = [...html]
  for (const nodo of nodosDe(html)) {
    if (!/\baria-hidden="true"/.test(nodo.atributos)) continue
    for (let i = nodo.desde; i < nodo.hasta; i += 1) caracteres[i] = ' '
  }
  const producido = caracteres.join('')
  mascaras.set(html, producido)
  return producido
}

/** El texto que un lector de pantalla anuncia para el subárbol de un nodo. */
export function textoAnunciado(html: string, nodo: Nodo): string {
  return textoDe(enmascararOcultos(html), nodo)
}

/** El texto anunciado del documento entero. */
export function documentoAnunciado(html: string): string {
  return textoAnunciado(html, nodosDe(html)[0])
}

// ── Los marcadores de contenido, tal como suenan ────────────────────────────

/** Las etiquetas que cuentan como «la frase» alrededor de un marcador. */
const BLOQUES: ReadonlySet<string> = new Set([
  'p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'figcaption', 'blockquote', 'dd', 'dt', 'td', 'th', 'button', 'a', 'label',
])

export interface MarcadorAnunciado {
  readonly marcador: string
  readonly seccion: string | null
  /** La frase entera en la que cae, tal como se anuncia. */
  readonly contexto: string
}

/** Cualquier cosa entre corchetes: la misma forma que usa `_contrato/marcadores.ts`. */
const CORCHETES = /\[[^\]]*\]/g

/**
 * A qué elemento le pertenece cada carácter del marcado: el más profundo que lo
 * contiene como TEXTO PROPIO.
 *
 * `nodosDe` devuelve los nodos en orden del documento y el rango de un
 * descendiente está siempre contenido en el de su ancestro, así que escribir en
 * ese orden deja arriba al de adentro: **el último que pisa una posición es el
 * más profundo**. No hace falta ordenar por profundidad ni comparar rangos.
 */
function duenioPorCaracter(largo: number, nodos: readonly Nodo[]): Int32Array {
  const duenio = new Int32Array(largo).fill(-1)
  for (const n of nodos) {
    for (let i = n.desde; i < n.hasta; i += 1) duenio[i] = n.indice
  }
  return duenio
}

/**
 * Los tramos de TEXTO del marcado: lo que queda entre una etiqueta y la
 * siguiente.
 *
 * Los marcadores se buscan por tramo y no sobre el documento entero, y las dos
 * razones tienen un caso real detrás: sobre el documento entero un `[` de un
 * tramo y un `]` de otro producirían un marcador que nadie escribió, y una
 * utilidad de Tailwind con corchetes en un ATRIBUTO (`[&>svg]:hidden`) se
 * contaría como si alguien la leyera en voz alta.
 *
 * `<[^>]*>` alcanza porque el marcado lo emite `renderToStaticMarkup`, que
 * escapa `>` adentro de los valores de atributo. Es el mismo supuesto que ya
 * hace `nodosDe`, declarado y no heredado en silencio.
 */
function tramosDeTexto(html: string): { readonly desde: number; readonly hasta: number }[] {
  const tramos: { desde: number; hasta: number }[] = []
  let cursor = 0
  for (const m of html.matchAll(/<[^>]*>/g)) {
    const inicio = m.index ?? 0
    if (inicio > cursor) tramos.push({ desde: cursor, hasta: inicio })
    cursor = inicio + m[0].length
  }
  if (cursor < html.length) tramos.push({ desde: cursor, hasta: html.length })
  return tramos
}

/**
 * Los marcadores que un lector de pantalla LEE EN VOZ ALTA, con la frase en la
 * que caen.
 *
 * Se buscan sobre el texto ANUNCIADO y no sobre el marcado crudo: un marcador
 * adentro de un subárbol `aria-hidden` no se escucha, y contarlo inflaría el
 * pedido a Franco con casillas que nadie oye. En este home no hay ninguno así,
 * y eso es un resultado — no un supuesto.
 *
 * ⚠️ La posición se busca sobre el marcado ENMASCARADO y la estructura sobre el
 * CRUDO, y eso vale porque `enmascararOcultos` reemplaza por espacios **de la
 * misma longitud**: los offsets de `nodosDe` sirven sobre las dos cadenas.
 */
export function marcadoresAnunciados(html: string): MarcadorAnunciado[] {
  const enmascarado = enmascararOcultos(html)
  const nodos = nodosDe(html)
  const duenio = duenioPorCaracter(html.length, nodos)
  const salida: MarcadorAnunciado[] = []

  for (const tramo of tramosDeTexto(html)) {
    const texto = enmascarado.slice(tramo.desde, tramo.hasta)
    for (const encontrado of texto.matchAll(CORCHETES)) {
      const nodo: Nodo | undefined = nodos[duenio[tramo.desde + (encontrado.index ?? 0)]]
      salida.push({
        marcador: encontrado[0].replace(/\s+/g, ' ').trim(),
        seccion: nodo === undefined ? null : nodo.seccion,
        contexto:
          nodo === undefined ? texto.replace(/\s+/g, ' ').trim() : fraseQueContiene(html, nodos, nodo),
      })
    }
  }
  return salida
}

/** La frase anunciada más chica que contiene al nodo. El nodo mismo si no hay. */
function fraseQueContiene(html: string, nodos: readonly Nodo[], hoja: Nodo): string {
  let mejor: Nodo = hoja
  for (const candidato of nodos) {
    if (!BLOQUES.has(candidato.etiqueta)) continue
    if (candidato.desde > hoja.desde || candidato.hasta < hoja.hasta) continue
    if (candidato.hasta - candidato.desde < mejor.hasta - mejor.desde || mejor === hoja) mejor = candidato
  }
  return textoAnunciado(html, mejor)
}

/**
 * ⚠️ **EL CENSO DE ANTES, CONSERVADO SÓLO COMO CONTROL POSITIVO.**
 *
 * No lo usa el censo ni ninguna otra comprobación: lo usa §7 del invariante para
 * demostrar, con la MISMA entrada, que el arreglo cambia el resultado. Es la
 * única forma de que «el detector nuevo cuenta 1» signifique algo — sin esto,
 * nadie puede distinguir un arreglo de una afirmación nueva sobre algo que ya
 * andaba.
 *
 * Es copia literal del cuerpo que estaba en `s10-acceso.ts` hasta B7, con su
 * salteo por `includes('<')` intacto. **Si alguien lo edita para que pase, borra
 * el control**: lo que se toca es el de arriba.
 */
export function marcadoresAnunciadosSoloHojas(html: string): MarcadorAnunciado[] {
  const enmascarado = enmascararOcultos(html)
  const nodos = nodosDe(html)
  const salida: MarcadorAnunciado[] = []
  for (const nodo of nodos) {
    if (nodo.hasta === nodo.desde) continue
    if (enmascarado.slice(nodo.desde, nodo.hasta).includes('<')) continue
    for (const encontrado of textoDe(enmascarado, nodo).matchAll(CORCHETES)) {
      salida.push({
        marcador: encontrado[0],
        seccion: nodo.seccion,
        contexto: fraseQueContiene(html, nodos, nodo),
      })
    }
  }
  return salida
}

/**
 * LAS DOS FORMAS QUE DISCRIMINAN EL CENSO. Cada una lleva **una sola**
 * propiedad, por la misma razón que `ROTOS`: con dos adentro, un control pasa
 * por la que no está mirando.
 */
export const FORMAS_DEL_CENSO = {
  /**
   * El punto ciego, en su forma mínima: un marcador en el TEXTO PROPIO de un
   * nodo que **además** tiene un hijo etiquetado. El censo de antes se saltea el
   * `<p>` por culpa del `<span>` y no encuentra nada; el de ahora cuenta 1.
   */
  conHijoEtiquetado: '<p>Lo que cambió [MÉTRICA] <span>y algo más</span></p>',
  /**
   * El otro lado de la misma moneda, que es lo que el salteo protegía: un
   * marcador que vive en una hoja anidada tiene que contarse **una** vez y no
   * una por ancestro. Sin este control, un arreglo que contara por nodo daría 3
   * acá y nadie lo notaría en un documento donde el total sube.
   */
  enHojaAnidada: '<div><p><span>[CIFRA]</span></p></div>',
} as const
