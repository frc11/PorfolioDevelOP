/**
 * EL ESQUELETO DEL DOCUMENTO — lo que el layout emite ALREDEDOR de la página,
 * derivado del fuente y no escrito acá.
 *
 * ⚠ **ESTE ARCHIVO ES EL PATCH DE §7.43 DE `DIRECCION-ESCENA.md`, Y ES LA
 * CONDICIÓN DE ENTRADA DEL ARREGLO DEL `contentinfo`.**
 *
 * `s10-banco.ts` componía el documento como *«todo adentro del `<main>`»*: el
 * envoltorio de la raíz, el del `<main>`, la página, y los dos cierres a mano.
 * Con ese modelo **nada emitido fuera del `<main>` existe**, así que sacar el
 * pie o la pastilla afuera —que es el arreglo correcto de los defectos 6 y 15
 * de §7.39— **bajaría** las cifras del instrumento: menos landmarks, no más. Un
 * instrumento que penaliza el arreglo correcto no puede quedar de árbitro, y
 * por eso el modelo va PRIMERO y el marcado después.
 *
 * ── Qué cambia, en una línea ───────────────────────────────────────────────
 *
 * El documento deja de ser una plantilla de cuatro piezas cosidas a mano y pasa
 * a ser **el esqueleto que el layout DECLARA**, recorrido en orden: cada
 * etiqueta literal se emite con sus atributos normalizados, cada componente se
 * monta desde un registro declarado, y `{children}` es la ranura donde entra la
 * página. Con eso, un `<footer>` hermano del `<main>` aparece en el modelo por
 * estar en el fuente — no porque alguien lo haya escrito acá.
 *
 * ── Por qué se DERIVA y no se escribe ──────────────────────────────────────
 *
 * Es la misma razón que `s10-banco.ts` ya declaraba para los dos envoltorios
 * viejos: escribir la estructura del documento en el instrumento es una segunda
 * fuente de la estructura del documento, y la segunda fuente es la que se queda
 * vieja sin que nadie se entere. Acá se sube la apuesta —ahora se deriva el
 * esqueleto ENTERO— por la misma razón y con el mismo costo.
 *
 * ── Los tres límites, cada uno con su salida ruidosa ───────────────────────
 *
 *   · **el texto suelto no se modela.** Un layout que escriba texto fuera de un
 *     elemento lo pierde. Hoy ninguno lo hace, y el día que uno lo haga es una
 *     decisión de contenido que este archivo no debería adivinar;
 *   · **un componente con hijos hace TIRAR al banco.** El modelo sabe montar
 *     hojas —un componente sin hijos, desde el registro— y no sabe componer
 *     hijos derivados adentro de un componente;
 *   · **un componente que el registro no conoce hace TIRAR al banco**, con el
 *     nombre adentro del mensaje. Un modelo que se saltea lo que no entiende
 *     publica una cifra más baja que se lee como un resultado, que es
 *     exactamente el modo de falla que este repo lleva diez sprints cazando.
 *
 * Los dos últimos los tira `s10-banco.ts`, que es quien tiene el registro; acá
 * quedan declarados porque son límites del MODELO, no de quien lo consume.
 */

import { leerEtiqueta, finDeLlaves, normalizarApertura } from './s10-jsx'

/** El atributo que marca la raíz del árbol de /v3. Una sola definición. */
export const MARCA_DE_LA_RAIZ = 'data-v3'

/**
 * Una pieza del esqueleto. Tres clases y no más: lo que el layout puede poner
 * alrededor de la página es una etiqueta, un componente, o la ranura.
 */
export type PiezaDelLayout =
  /** `{children}` — donde entra la página. */
  | { readonly clase: 'ranura' }
  /** `<Navegacion />` — se monta desde el registro del banco. */
  | { readonly clase: 'componente'; readonly nombre: string; readonly hijos: readonly PiezaDelLayout[] }
  /** `<main class="…">` — se emite tal cual, con sus hijos adentro. */
  | {
      readonly clase: 'etiqueta'
      readonly nombre: string
      readonly apertura: string
      readonly autocerrada: boolean
      readonly hijos: readonly PiezaDelLayout[]
    }

export interface Esqueleto {
  /** El nombre de la etiqueta raíz, en minúscula. */
  readonly nombre: string
  /** Su apertura ya normalizada a HTML. */
  readonly apertura: string
  readonly hijos: readonly PiezaDelLayout[]
}

interface Resultado {
  readonly pieza: PiezaDelLayout
  /** El índice del primer carácter DESPUÉS de la pieza. */
  readonly fin: number
}

function parsearElemento(texto: string, inicio: number): Resultado | null {
  const etiqueta = leerEtiqueta(texto, inicio)
  if (etiqueta === null) return null
  const esComponente = /^[A-Z]/.test(etiqueta.nombre)
  const nombre = esComponente ? etiqueta.nombre : etiqueta.nombre.toLowerCase()

  if (etiqueta.autocerrada) {
    return {
      pieza: esComponente
        ? { clase: 'componente', nombre, hijos: [] }
        : {
            clase: 'etiqueta',
            nombre,
            apertura: normalizarApertura(nombre, etiqueta.atributos),
            autocerrada: true,
            hijos: [],
          },
      fin: etiqueta.fin + 1,
    }
  }

  const { hijos, fin } = parsearHijos(texto, etiqueta.fin + 1)
  return {
    pieza: esComponente
      ? { clase: 'componente', nombre, hijos }
      : {
          clase: 'etiqueta',
          nombre,
          apertura: normalizarApertura(nombre, etiqueta.atributos),
          autocerrada: false,
          hijos,
        },
    fin,
  }
}

/**
 * Los hijos de un elemento, hasta su etiqueta de cierre.
 *
 * `{children}` es la ranura; cualquier otra expresión se saltea —una expresión
 * que no sea la ranura no aporta estructura al documento— y el texto suelto no
 * se modela, que es el primer límite declarado arriba.
 */
function parsearHijos(texto: string, desde: number): { readonly hijos: PiezaDelLayout[]; readonly fin: number } {
  const hijos: PiezaDelLayout[] = []
  let i = desde
  while (i < texto.length) {
    const c = texto[i]
    if (c === '{') {
      const fin = finDeLlaves(texto, i)
      if (fin < 0) break
      if (texto.slice(i + 1, fin).trim() === 'children') hijos.push({ clase: 'ranura' })
      i = fin + 1
      continue
    }
    if (c === '<') {
      if (texto.startsWith('</', i)) {
        const cierre = texto.indexOf('>', i)
        return { hijos, fin: cierre < 0 ? texto.length : cierre + 1 }
      }
      const parsado = parsearElemento(texto, i)
      if (parsado === null) {
        i += 1
        continue
      }
      hijos.push(parsado.pieza)
      i = parsado.fin
      continue
    }
    i += 1
  }
  return { hijos, fin: i }
}

/**
 * EL ESQUELETO QUE EL LAYOUT DECLARA, desde su elemento raíz.
 *
 * La raíz es **el elemento que lleva `data-v3`**, y no «el primer `<div>`»: el
 * atributo es el que define el alcance del árbol de /v3 —lo dice el propio
 * layout, y `theme-develop.css` acota ahí su anillo de foco— así que es la
 * marca correcta para saber dónde empieza el documento. Devuelve `null` si no
 * está: **nunca inventa una raíz**, que es lo que haría de esto un instrumento
 * inútil para la pregunta que contesta.
 */
export function esqueletoDelLayout(fuente: string): Esqueleto | null {
  const marca = new RegExp(`\\b${MARCA_DE_LA_RAIZ}\\b`)
  for (let i = fuente.indexOf('<'); i >= 0; i = fuente.indexOf('<', i + 1)) {
    const etiqueta = leerEtiqueta(fuente, i)
    if (etiqueta === null || !marca.test(etiqueta.atributos)) continue
    const parsado = parsearElemento(fuente, i)
    if (parsado === null || parsado.pieza.clase !== 'etiqueta') return null
    return { nombre: parsado.pieza.nombre, apertura: parsado.pieza.apertura, hijos: parsado.pieza.hijos }
  }
  return null
}

/** Los nombres de los componentes que el esqueleto monta, en orden y sin repetir. */
export function componentesDelEsqueleto(piezas: readonly PiezaDelLayout[]): string[] {
  const nombres: string[] = []
  const recorrer = (lista: readonly PiezaDelLayout[]): void => {
    for (const pieza of lista) {
      if (pieza.clase === 'ranura') continue
      if (pieza.clase === 'componente' && !nombres.includes(pieza.nombre)) nombres.push(pieza.nombre)
      recorrer(pieza.hijos)
    }
  }
  recorrer(piezas)
  return nombres
}

/**
 * Las etiquetas literales que el esqueleto emite FUERA del `<main>`, en orden.
 *
 * Es lo que hace auditable el arreglo de los defectos 6 y 15: un `<footer>`
 * hermano del `<main>` sale en esta lista, y uno adentro del `<main>` no. La
 * raíz no cuenta —es el envoltorio, no algo que el layout ponga al lado de la
 * página— así que se recorre desde sus hijos.
 */
export function etiquetasFueraDelMain(piezas: readonly PiezaDelLayout[]): string[] {
  const salida: string[] = []
  const recorrer = (lista: readonly PiezaDelLayout[], dentroDelMain: boolean): void => {
    for (const pieza of lista) {
      if (pieza.clase === 'ranura') continue
      if (pieza.clase === 'componente') {
        recorrer(pieza.hijos, dentroDelMain)
        continue
      }
      const esMain = pieza.nombre === 'main'
      if (!dentroDelMain && !esMain) salida.push(pieza.nombre)
      recorrer(pieza.hijos, dentroDelMain || esMain)
    }
  }
  recorrer(piezas, false)
  return salida
}
