/**
 * LA PLOMERÍA DEL FRENTE DE MOBILE — los detectores puros, sus entradas rotas y
 * las tablas del modelo.
 *
 * ⚠️ **ESTE ARCHIVO NO SE ESCANEA POR TOKENS, y hay que decirlo.** Guarda a
 * propósito marcados fabricados con `h-svh` y `min-h-svh` sueltos, píxeles
 * literales y clases armadas a mano: son las ENTRADAS de los controles
 * positivos. Escanearlo haría fallar la comprobación por culpa de su propio
 * arnés. Es la misma excepción declarada que `_secciones/cierre/soporte.ts`
 * lleva escrita, y por la misma razón: **un detector se prueba corriendo LA
 * MISMA función contra una entrada equivocada**, y para eso tiene que vivir
 * afuera del archivo que lo usa.
 *
 * ── ⚠️ QUÉ ES CADA CIFRA QUE SALE DE ACÁ ───────────────────────────────────
 *
 * Regla 10 del sprint. Nada de esto es una medición de navegador:
 *
 *   · **`medirPantallas`** cuenta CAJAS DE PANTALLA (`min-h-svh` / `h-svh`) del
 *     marcado del servidor, combinándolas por columna (suma) o por fila (máximo)
 *     según la clase de display que aplique a ese ancho. No hace layout: no sabe
 *     de `overflow`, de márgenes negativos ni de `order`.
 *   · **`altoDeTinta`** suma CAJAS DE LÍNEA de los elementos con `data-nivel`
 *     más las cajas de medio con `aspect-ratio`. **Es un PISO, por tres motivos
 *     que empujan todos para el mismo lado:** ignora separaciones, rellenos y
 *     bordes; usa el ancho de contenido del envoltorio como ancho disponible
 *     —una columna real es más angosta, o sea más líneas—; y `s10-avance` mide
 *     la instancia por defecto de la variable, más angosta que `medio` o `semi`.
 *     Si la tinta sola ya no entra, la caja CRECE seguro.
 *   · **`anchoDeLaPastilla`** suma las piezas que `_estilos/navegacion.css`
 *     declara. También es un PISO, y por el mismo motivo del avance.
 *
 * El modelo del alto del Cierre vive en `./s10-mobile-pie`, que este archivo NO
 * importa: la costura va en un solo sentido y está explicada allá.
 */

import { ALTO_PASTILLA_PX, DESCUENTO_NACIMIENTO_PX, ENLACES_DE_MUESTRA } from '../navegacion'
import { NIVELES, NIVELES_TIPOGRAFICOS, type Nivel } from '../tipografia'
import { FUENTE_CODIGO, FUENTE_TITULO, anchoDeTexto, lineasDeTexto } from './s10-avance'
import { anchoDeContenido, clasesEfectivas, tokenPx } from './s10-css'
import { atributo, nodosDe, textoDe, type Nodo } from './s10-recorrido'
import { leerAvancesDe, type TablasDeAvance } from './s10-woff2'

export const CHIVO: TablasDeAvance = leerAvancesDe(FUENTE_TITULO)
export const CHIVO_MONO: TablasDeAvance = leerAvancesDe(FUENTE_CODIGO)

/** Los interletrados, como fracción de `em`. Salen del tema y no se escriben. */
export const tracking = (nombre: string): number => tokenPx(`--tracking-${nombre}`, 0) / 16

// ── El árbol ────────────────────────────────────────────────────────────────

export interface Rama {
  readonly nodo: Nodo
  readonly hijos: Rama[]
}

/** El marcado como árbol. `nodosDe` ya cuenta la profundidad; acá se ata. */
export function arbolDe(html: string): Rama[] {
  const raices: Rama[] = []
  const pila: Rama[] = []
  for (const nodo of nodosDe(html)) {
    const rama: Rama = { nodo, hijos: [] }
    while (pila.length > nodo.profundidad) pila.pop()
    if (pila.length === 0) raices.push(rama)
    else pila[pila.length - 1].hijos.push(rama)
    pila.push(rama)
  }
  return raices
}

export function seccionesDe(ramas: readonly Rama[]): Rama[] {
  return ramas.flatMap((r) => (r.nodo.etiqueta === 'section' ? [r] : seccionesDe(r.hijos)))
}

/**
 * Cuántas columnas tiene una grilla. **Gana la ÚLTIMA clase que aplica**, que es
 * lo que hace el navegador: `grid-cols-1 tablet:grid-cols-3` a 768 emite las dos
 * reglas con la misma especificidad y manda la que Tailwind escribe después.
 * Quedarse con la primera —el error que este detector cometió— dice «una
 * columna» a 768 y da por lleno un tramo que está vacío.
 */
export function columnasDe(clases: readonly string[]): number {
  let n = 1
  for (const c of clases) {
    const m = /^grid-cols-(\d+)$/.exec(c)
    if (m !== null) n = Number.parseInt(m[1], 10)
    else if (c.startsWith('grid-cols-[')) n = (c.match(/_/g) ?? []).length + 1
  }
  return n
}

/** Si los hijos se acuestan en fila: una grilla de más de una columna, o un flex
 *  que no declara `flex-col`. Todo lo demás apila. */
export function esFila(clases: readonly string[]): boolean {
  if (clases.includes('grid')) return columnasDe(clases) > 1
  return clases.includes('flex') && !clases.includes('flex-col')
}

const fueraDeFlujo = (clases: readonly string[]): boolean =>
  clases.includes('absolute') || clases.includes('fixed')

export interface Desborde {
  readonly seccion: string
  readonly etiqueta: string
  /** Pantallas que la caja CLAVA con su alto fijo. */
  readonly clavadas: number
  /** Pantallas que su contenido ocupa. */
  readonly contenido: number
}

export interface Medida {
  readonly pantallas: number
  readonly desbordes: Desborde[]
}

/**
 * PANTALLAS DE FLUJO de un subárbol a un ancho dado, y las cajas clavadas que
 * su contenido desborda.
 *
 * `h-svh` es un alto FIJO: la caja mide una pantalla pase lo que pase, y lo que
 * no entra se sale. `min-h-svh` es un mínimo: la caja crece y no recorta nada.
 * **Confundirlos es confundir un defecto con una decisión**, y es la distinción
 * entera de este frente.
 */
export function medirPantallas(rama: Rama, ancho: number): Medida {
  const clases = clasesEfectivas(atributo(rama.nodo, 'class') ?? '', ancho)
  const enFlujo = rama.hijos.filter((h) => !fueraDeFlujo(clasesEfectivas(atributo(h.nodo, 'class') ?? '', ancho)))
  const medidas = enFlujo.map((h) => medirPantallas(h, ancho))
  const desbordes = medidas.flatMap((m) => m.desbordes)
  const contenido =
    medidas.length === 0
      ? 0
      : esFila(clases)
        ? Math.max(...medidas.map((m) => m.pantallas))
        : medidas.reduce((a, m) => a + m.pantallas, 0)
  if (clases.includes('h-svh')) {
    if (contenido > 1) {
      desbordes.push({
        seccion: rama.nodo.seccion ?? '(sin sección)',
        etiqueta: rama.nodo.etiqueta,
        clavadas: 1,
        contenido,
      })
    }
    return { pantallas: 1, desbordes }
  }
  return { pantallas: Math.max(clases.includes('min-h-svh') ? 1 : 0, contenido), desbordes }
}

// ── La tinta ────────────────────────────────────────────────────────────────

/** El token de tamaño que gobierna una caja: el fluido si su clase está puesta. */
export function tokenDeCaja(nivel: Nivel, clases: string): string {
  const d = NIVELES_TIPOGRAFICOS[nivel]
  const fluida = d.claseFluida
  return fluida !== null && clases.split(/\s+/).includes(fluida) ? `--text-fluido-${nivel}` : d.token
}

/** Un subárbol como suma de cajas de línea y cajas de medio. Es un PISO. */
export function altoDeTinta(html: string, desde: number, hasta: number, ancho: number): number {
  const disponible = anchoDeContenido(ancho)
  let total = 0
  for (const n of nodosDe(html)) {
    if (n.indice < desde || n.indice > hasta) continue
    const relacion = /aspect-ratio:([\d.]+) \/ ([\d.]+)/.exec(n.atributos)
    if (relacion !== null) {
      total += (disponible * Number(relacion[2])) / Number(relacion[1])
      continue
    }
    const nivel = atributo(n, 'data-nivel') as Nivel | null
    if (nivel === null || !(nivel in NIVELES_TIPOGRAFICOS)) continue
    const d = NIVELES_TIPOGRAFICOS[nivel]
    const clases = atributo(n, 'class') ?? ''
    const tam = tokenPx(tokenDeCaja(nivel, clases), ancho)
    const crudo = textoDe(html, n)
    const texto = clases.includes('uppercase') ? crudo.toUpperCase() : crudo
    const tablas = clases.includes('font-codigo') ? CHIVO_MONO : CHIVO
    const lineas = lineasDeTexto(tablas, texto, disponible, tam, tracking(d.interletrado))
    total += lineas * tam * tokenPx(`--leading-${d.interlineado}`, ancho)
  }
  return total
}

/** El último índice del subárbol de un nodo, para poder acotar `altoDeTinta`. */
export function finDelSubarbol(html: string, nodo: Nodo): number {
  const dentro = nodosDe(html).filter((o) => o.desde >= nodo.desde && o.hasta <= nodo.hasta)
  return dentro.length === 0 ? nodo.indice : Math.max(...dentro.map((o) => o.indice))
}

/**
 * LA TINTA DE LA CAJA CLAVADA de una sección, a un ancho. Devuelve 0 si a ese
 * ancho la sección no tiene ninguna: un cero acá significa «no hay caja», no
 * «la caja está vacía», y por eso quien lo publica dice cuál de las dos.
 */
export function tintaDeLaCajaClavada(html: string, ancho: number, seccion = 'servicios'): number {
  const caja = nodosDe(html).find(
    (n) => n.seccion === seccion && clasesEfectivas(atributo(n, 'class') ?? '', ancho).includes('h-svh'),
  )
  return caja === undefined ? 0 : altoDeTinta(html, caja.indice, finDelSubarbol(html, caja), ancho)
}

// ── La pastilla ─────────────────────────────────────────────────────────────

export interface EnlaceMedido {
  readonly rotulo: string
  readonly px: number
}

export interface Pastilla {
  readonly total: number
  readonly enlaces: EnlaceMedido[]
  readonly alto: number
  readonly nacimiento: (alto: number) => number
}

/**
 * EL ANCHO DE LA PASTILLA, sumado pieza por pieza de `_estilos/navegacion.css`:
 * relleno lateral de la pastilla, los cinco enlaces con su propio relleno, su
 * marcador de `--spacing-1` y su canaleta, y las cuatro separaciones de la
 * lista. **Es un PISO**: los rótulos van en `font-semi` y el lector de avances
 * mide la instancia por defecto, que es más angosta.
 */
export function anchoDeLaPastilla(ancho: number): Pastilla {
  const tam = tokenPx('--text-cuerpo', ancho)
  const enlaces = ENLACES_DE_MUESTRA.map((e) => ({
    rotulo: e.rotulo,
    px:
      2 * tokenPx('--spacing-2', ancho) +
      2 * tokenPx('--spacing-1', ancho) +
      anchoDeTexto(CHIVO, e.rotulo, tam, tracking('texto')),
  }))
  const total =
    2 * tokenPx('--spacing-4', ancho) +
    enlaces.reduce((a, e) => a + e.px, 0) +
    (enlaces.length - 1) * tokenPx('--spacing-2', ancho)
  return {
    total,
    enlaces,
    alto: ALTO_PASTILLA_PX,
    nacimiento: (alto: number): number => alto - DESCUENTO_NACIMIENTO_PX,
  }
}

// ── La escala ───────────────────────────────────────────────────────────────

export interface NivelResuelto {
  readonly nivel: Nivel
  readonly token: string
  readonly px: number
  readonly fluido: boolean
}

export function escalaA(ancho: number): NivelResuelto[] {
  return NIVELES.map((nivel) => {
    const fluido = NIVELES_TIPOGRAFICOS[nivel].claseFluida !== null
    const token = fluido ? `--text-fluido-${nivel}` : NIVELES_TIPOGRAFICOS[nivel].token
    return { nivel, token, px: tokenPx(token, ancho), fluido }
  })
}

// ── LAS ENTRADAS FABRICADAS ROTAS ───────────────────────────────────────────

/** Una caja clavada de una pantalla con TRES adentro: el detector tiene que verla. */
export const CLAVADA_QUE_DESBORDA =
  '<div class="w-full sticky top-0 h-svh"><div class="flex flex-col"><div class="min-h-svh"></div><div class="min-h-svh"></div><div class="min-h-svh"></div></div></div>'
/** La misma caja con lo que le entra: el detector NO tiene que verla. */
export const CLAVADA_QUE_ENTRA =
  '<div class="w-full sticky top-0 h-svh"><div class="flex flex-col"><div class="min-h-svh"></div></div></div>'
/** Sin una sola caja de pantalla: el contador tiene que devolver cero. */
export const SIN_PANTALLAS = '<div class="w-full"><p data-nivel="cuerpo" class="text-cuerpo">x</p></div>'
/** Tres cajas de pantalla EN FILA: la fila mide una, no tres. */
export const TRES_EN_FILA =
  '<div class="grid grid-cols-1 tablet:grid-cols-3"><div class="min-h-svh"></div><div class="min-h-svh"></div><div class="min-h-svh"></div></div>'
