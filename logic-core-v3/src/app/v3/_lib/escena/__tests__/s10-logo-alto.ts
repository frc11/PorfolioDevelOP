/**
 * DÓNDE CAE CADA CAJA DE TEXTO EN EL EJE VERTICAL — el reparto que faltaba.
 *
 * ⚠ **Este archivo NO se escanea por tokens.** Como `s10-logo-cajas.ts`, sus
 * únicos literales son índices y el `2` del alto de un cuadro; toda medida sale
 * de `tokenPx` sobre `theme-develop.css`.
 *
 * ── ⚠️ POR QUÉ EXISTE: EL DEFECTO QUE TAPÓ, CON SU LÍNEA ──────────────────
 *
 * `s10-vertical.invariant.ts` §5 publicaba **«LA SUPERPOSICIÓN CON LA COLUMNA —
 * 0 % en seis de siete»** para el hero a 390. Lo que esa cifra medía era
 * `barridoVertical(...).minima` (`s10-logo-lectura.ts:140`, consumido en
 * `s10-vertical.invariant.ts:92`): el **mínimo sobre todas las posiciones
 * verticales que la caja podría ocupar**. Su propia línea de afirmación lo dice
 * —*«existe una altura con superposición CERO»*— y es verdad; lo que no es
 * verdad es leerlo como «no se superpone», porque **el bloque no está en esa
 * altura**. Está donde lo pone `justify-center`, que es el medio de la pantalla,
 * que es exactamente donde está el logo.
 *
 * Medido con el navegador (`scripts-tapado/a-verdad.ts`), en la misma ventana
 * donde el instrumento decía 0 %: **54,8 % de la tinta del titular sobre la masa
 * negra, y el 54,7 % de ella por debajo de AA**.
 *
 * Un mínimo sobre posiciones hipotéticas contesta *«¿es EVITABLE moviendo el
 * bloque?»*. Ésa es una pregunta buena y se sigue haciendo — es la que dice si
 * mover el texto alcanza. Pero no es *«¿cuánto se superpone?»*, y publicarla con
 * ese nombre es la clase de falla que este repo llama «verde por arnés»: el
 * instrumento fabrica la entrada favorable que después afirma.
 *
 * ── QUÉ MODELA, exactamente ───────────────────────────────────────────────
 *
 *   · `min-h-svh` → la caja mide al menos el viewport.
 *   · `pt-N`, `pb-N`, `py-N` y sus formas `p?-[var(--t)]` → el padding vertical.
 *   · `flex` + `flex-col` → los hijos se apilan; `gap-N` los separa.
 *   · `justify-start|center|end|between` en un `flex-col` → dónde cae el
 *     contenido dentro del sobrante.
 *   · `grid` con N columnas → filas de N hijos; el alto de una fila es el mayor
 *     de sus hijos, y `content-start|center|end|between|evenly` la reparte.
 *   · `flex` sin `flex-col` → los hijos comparten fila: el alto es el mayor.
 *   · cualquier otro elemento → sus hijos, apilados.
 *
 * Las clases se leen **después** de `clasesEfectivas`, igual que el reparto
 * horizontal: `escritorio:grid-cols-5` existe a 1025 y no a 1024.
 *
 * ── ⚠ LOS SUPUESTOS, declarados y devueltos con cada medición ─────────────
 *
 * Están en `SUPUESTOS_DEL_ALTO`, y además **toda medición devuelve la lista de
 * clases que encontró y NO sabe modelar** (`sinModelar`). Un modelo que se calla
 * lo que no entiende publica una cifra que parece completa; éste obliga a que
 * quien la use decida qué hacer con lo que falta. La prueba de que el modelo
 * sirve no es que exista: es el contraste contra el navegador, que vive en
 * `s10-logo-recibos-de-tapado.ts` y se afirma con su delta.
 */

import { tokenPx } from '../../__tests__/s10-css'
import { aCuadroAlto, aCuadroX, arbolDeLaSeccion, type ArbolDeSeccion, type CajaMedida } from './s10-logo-cajas'
import { celdasEnLaCaja, superposicion } from './s10-logo-lectura'
import type { MuestraDelLogo } from './s10-logo'

export const SUPUESTOS_DEL_ALTO: readonly string[] = [
  'no modela márgenes, `flex-1`/`grow`, `h-full`, `aspect-*` ni medios con alto intrínseco: un hijo que crece se mide por su contenido',
  'no modela `position: absolute|fixed|sticky`: un hijo sacado de flujo se sigue midiendo como si estuviera en él',
  '`min-h-svh` se resuelve contra el alto de ventana que se pasa; `svh` y `dvh` se tratan igual porque el banco no tiene barra de navegador que entre y salga',
  'el alto de una caja de texto es el de `s10-logo-cajas.ts` —líneas × tamaño × interlineado— y hereda sus supuestos: sin márgenes y sin descuelgue de la última línea',
  'toda clase vertical que el modelo no conoce se DEVUELVE en `sinModelar` en vez de ignorarse en silencio',
]

/** Un rectángulo en píxeles de viewport: la caja horizontal ya la dio el otro archivo. */
export interface CajaEnPantalla {
  readonly nodo: number
  readonly caja: CajaMedida
  /** El borde de arriba, en píxeles desde el borde de arriba del viewport. */
  readonly arribaPx: number
  /**
   * El alto del NODO con este modelo. ⚠ No es lo mismo que `caja.altoPx`, que es
   * el alto del TEXTO: coinciden mientras el nodo no declare padding vertical
   * propio, y hoy ninguna caja de texto lo declara. Quien mide superposición usa
   * `caja.altoPx` —la tinta, no el contenedor—; esto se expone para poder ver la
   * diferencia el día que aparezca.
   */
  readonly altoPx: number
}

export interface RepartoVertical {
  readonly id: string
  readonly ancho: number
  readonly alto: number
  /** El alto total que la sección ocupa con este modelo. */
  readonly altoDeLaSeccionPx: number
  readonly cajas: readonly CajaEnPantalla[]
  /** Las clases verticales que aparecieron y el modelo no sabe resolver. */
  readonly sinModelar: readonly string[]
}

const RE_PAD_VAR = /^p([tby])-\[var\((--[a-z0-9-]+)\)\]$/
const RE_PAD_ESC = /^p([tby])-(\d+)$/
const RE_GAP_VAR = /^gap(?:-y)?-\[var\((--[a-z0-9-]+)\)\]$/
const RE_GAP_ESC = /^gap(?:-y)?-(\d+)$/

/** Las clases verticales que el modelo reconoce que existen y NO sabe resolver. */
const NO_MODELADAS = [
  'flex-1',
  'grow',
  'h-full',
  'absolute',
  'fixed',
  'sticky',
  'items-stretch',
] as const

function ultima(clases: readonly string[], prueba: (c: string) => boolean): string | undefined {
  for (let i = clases.length - 1; i >= 0; i -= 1) if (prueba(clases[i])) return clases[i]
  return undefined
}

interface Paddings {
  readonly arriba: number
  readonly abajo: number
}

function paddingsDe(clases: readonly string[], ancho: number): Paddings {
  let arriba = 0
  let abajo = 0
  for (const c of clases) {
    const v = RE_PAD_VAR.exec(c)
    const e = RE_PAD_ESC.exec(c)
    const eje = v?.[1] ?? e?.[1]
    if (eje === undefined) continue
    const px = v !== null ? tokenPx(v[2], ancho) : tokenPx(`--spacing-${e![2]}`, ancho)
    if (eje === 't' || eje === 'y') arriba = px
    if (eje === 'b' || eje === 'y') abajo = px
  }
  return { arriba, abajo }
}

function gapDe(clases: readonly string[], ancho: number): number {
  const v = ultima(clases, (c) => RE_GAP_VAR.test(c))
  if (v !== undefined) return tokenPx(RE_GAP_VAR.exec(v)![1], ancho)
  const e = ultima(clases, (c) => RE_GAP_ESC.test(c))
  if (e !== undefined) return tokenPx(`--spacing-${RE_GAP_ESC.exec(e)![1]}`, ancho)
  return 0
}

/** Cuántas columnas tiene la grilla de este nodo, o 0 si no es grilla. */
function columnasDe(clases: readonly string[]): number {
  if (!clases.includes('grid')) return 0
  const cols = ultima(clases, (c) => c.startsWith('grid-cols-'))
  if (cols === undefined) return 0
  if (cols.includes('minmax')) return 2
  const n = Number.parseInt(cols.slice('grid-cols-'.length), 10)
  return Number.isFinite(n) && n >= 1 ? n : 0
}

type Distribucion = 'start' | 'center' | 'end' | 'between' | 'evenly'

/**
 * El reparto del sobrante EN EL EJE VERTICAL, o `null` si el nodo no lo declara.
 *
 * ⚠ **La propiedad que manda no es la misma en los dos contenedores, y
 * confundirlas invierte el eje.** En un `flex-col` el eje principal es el
 * vertical y lo reparte `justify-content`; en una grilla el vertical es el eje
 * de bloque y lo reparte `align-content` —`content-*` en Tailwind—. Un
 * `justify-*` en una grilla mueve las COLUMNAS, no las filas, así que leerlo acá
 * daría un desplazamiento vertical que la pantalla no tiene.
 */
function distribucionVertical(clases: readonly string[]): Distribucion | null {
  const esGrilla = clases.includes('grid')
  const esColumna = clases.includes('flex') && clases.includes('flex-col')
  const prefijo = esGrilla ? 'content-' : esColumna ? 'justify-' : null
  if (prefijo === null) return null
  const c = ultima(clases, (k) => k.startsWith(prefijo))
  if (c === undefined) return null
  const v = c.slice(prefijo.length)
  return v === 'start' || v === 'center' || v === 'end' || v === 'between' || v === 'evenly' ? v : null
}

/**
 * EL REPARTO VERTICAL DE UNA SECCIÓN, en una ventana concreta.
 *
 * Dos pasadas sobre el mismo árbol que `s10-logo-cajas.ts` ya armó: la primera
 * mide el alto de cada nodo de las hojas hacia la raíz, la segunda coloca cada
 * uno de la raíz hacia las hojas. Es el mismo orden que hace un motor de layout,
 * y es la razón por la que el `min-h-svh` de un ancestro puede empujar a un
 * descendiente sin que el descendiente sepa nada.
 */
export interface OpcionesDelReparto {
  /**
   * REESCRIBE LAS CLASES DE UN NODO ANTES DE REPARTIR — para medir una
   * composición sin escribirla en el árbol.
   *
   * Es la misma palanca que `conPose` es para la escena, y existe por la misma
   * razón: un control positivo necesita poder correr **la función de verdad**
   * contra una composición de la que ya se sabe la respuesta. Sin esto, el
   * control tendría que reimplementar el reparto, y un reparto reimplementado no
   * prueba el de al lado.
   *
   * El árbol HORIZONTAL no se toca: esto sólo cambia lo que el eje vertical lee.
   */
  readonly clasesDe?: (clases: readonly string[], nodo: number) => readonly string[]
}

export function repartoVertical(
  id: string,
  ancho: number,
  alto: number,
  opciones: OpcionesDelReparto = {},
): RepartoVertical {
  const arbol: ArbolDeSeccion = arbolDeLaSeccion(id, ancho)
  const { nodos, hijos, cajaDe } = arbol
  const clases =
    opciones.clasesDe === undefined ? arbol.clases : arbol.clases.map((c, i) => opciones.clasesDe!(c, i))
  const sinModelar = new Set<string>()

  const altoDe = new Array<number>(nodos.length).fill(0)
  const contenidoDe = new Array<number>(nodos.length).fill(0)

  /** El alto del CONTENIDO de un nodo: lo que sus hijos ocupan, sin su padding. */
  const medirContenido = (i: number): number => {
    const c = clases[i]
    for (const k of NO_MODELADAS) if (c.includes(k)) sinModelar.add(k)

    /**
     * ⚠️ **PAPEL-2 · UN NODO APAGADO NO OCUPA, Y EL MODELO NO LO SABÍA.**
     *
     * `display:none` saca el elemento del flujo: no mide, y en una columna flex
     * deja de ser ítem, o sea que **también se lleva su hueco**. Hasta este
     * sprint ningún nodo del lane se apagaba por ancho y el modelo no tenía por
     * qué saberlo; la marca del Hero —`chico:hidden`, presente en el marcado de
     * los ocho anchos y visible en dos— lo estrena.
     *
     * Sin esto el modelo le sumaba la marca a los SEIS anchos donde no se ve, y
     * el efecto no era teórico: movía el bloque derivado de 1440 y de 1920, que
     * son los dos que este sprint tiene prohibido mover. La clase llega acá ya
     * resuelta por `clasesEfectivas`, así que preguntar por `hidden` pelado es
     * preguntar «está apagado A ESTE ancho».
     */
    if (c.includes('hidden')) return 0

    const caja = cajaDe.get(i)
    if (caja !== undefined) return caja.altoPx
    const misHijos = hijos[i]
    if (misHijos.length === 0) return 0
    const gap = gapDe(c, ancho)
    const cols = columnasDe(c)
    if (cols >= 1) {
      let total = 0
      let filas = 0
      for (let k = 0; k < misHijos.length; k += cols) {
        let mayor = 0
        for (let j = k; j < Math.min(k + cols, misHijos.length); j += 1) mayor = Math.max(mayor, altoDe[misHijos[j]])
        total += mayor
        filas += 1
      }
      return total + gap * Math.max(0, filas - 1)
    }
    if (c.includes('flex') && !c.includes('flex-col')) {
      let mayor = 0
      for (const h of misHijos) mayor = Math.max(mayor, altoDe[h])
      return mayor
    }
    let suma = 0
    for (const h of misHijos) suma += altoDe[h]
    return suma + (c.includes('flex-col') ? gap * Math.max(0, misHijos.length - 1) : 0)
  }

  // Primera pasada: de las hojas a la raíz. El orden de `nodosDe` es de
  // documento, así que recorrerlo al revés garantiza que todo hijo ya se midió.
  for (let i = nodos.length - 1; i >= 0; i -= 1) {
    const c = clases[i]
    const p = paddingsDe(c, ancho)
    contenidoDe[i] = medirContenido(i)
    const propio = contenidoDe[i] + p.arriba + p.abajo
    altoDe[i] = c.includes('min-h-svh') || c.includes('h-svh') ? Math.max(propio, alto) : propio
  }

  // Segunda pasada: de la raíz a las hojas.
  const arribaDe = new Array<number>(nodos.length).fill(0)
  const colocar = (i: number, arriba: number): void => {
    arribaDe[i] = arriba
    const c = clases[i]
    const misHijos = hijos[i]
    if (misHijos.length === 0) return
    const p = paddingsDe(c, ancho)
    const gap = gapDe(c, ancho)
    const cols = columnasDe(c)
    const esColumna = cols === 0 && (!c.includes('flex') || c.includes('flex-col'))
    const espacio = altoDe[i] - p.arriba - p.abajo
    const sobrante = Math.max(0, espacio - contenidoDe[i])
    const como = distribucionVertical(c)

    if (cols >= 1) {
      // Grilla: filas de `cols`. El sobrante lo reparte `content-*`.
      const filas: number[][] = []
      for (let k = 0; k < misHijos.length; k += cols) filas.push(misHijos.slice(k, k + cols))
      const extra = repartir(como, sobrante, filas.length)
      let cursor = arriba + p.arriba + extra.antes
      for (const fila of filas) {
        let mayor = 0
        for (const h of fila) mayor = Math.max(mayor, altoDe[h])
        for (const h of fila) colocar(h, cursor)
        cursor += mayor + gap + extra.entre
      }
      return
    }
    if (!esColumna) {
      // Fila flex: todos arrancan en el mismo borde de arriba.
      for (const h of misHijos) colocar(h, arriba + p.arriba)
      return
    }
    const extra = repartir(como, sobrante, misHijos.length)
    let cursor = arriba + p.arriba + extra.antes
    for (const h of misHijos) {
      colocar(h, cursor)
      cursor += altoDe[h] + (c.includes('flex-col') ? gap : 0) + extra.entre
    }
  }
  const raiz = nodos.findIndex((_, i) => arbol.padre[i] === -1)
  if (raiz >= 0) colocar(raiz, 0)

  /**
   * ⚠️ **PAPEL-2 · LA SEGUNDA MITAD DEL APAGADO.** Volver 0 el alto de un nodo
   * `hidden` lo saca de la CUENTA, pero su caja de texto sigue en `cajaDe` con
   * una posición, y `bloqueDeTexto` —que es la envolvente de todas las cajas—
   * la seguía contando. Medido a 390: la palabra de la marca apareció como una
   * caja de 12 px en el tope del bloque, o sea en un ancho donde no se dibuja.
   * Un nodo apagado apaga también a sus DESCENDIENTES, así que se sube por el
   * árbol.
   */
  const apagado = (i: number): boolean => {
    for (let k: number = i; k >= 0; k = arbol.padre[k]) if (clases[k].includes('hidden')) return true
    return false
  }
  const cajas: CajaEnPantalla[] = []
  for (const [nodo, caja] of cajaDe) {
    if (apagado(nodo)) continue
    cajas.push({ nodo, caja, arribaPx: arribaDe[nodo], altoPx: altoDe[nodo] })
  }
  return {
    id,
    ancho,
    alto,
    altoDeLaSeccionPx: raiz >= 0 ? altoDe[raiz] : 0,
    cajas,
    sinModelar: [...sinModelar].sort(),
  }
}

/** Cuánto sobrante va ANTES del primer hijo y cuánto ENTRE cada par. */
function repartir(como: Distribucion | null, sobrante: number, cuantos: number): { antes: number; entre: number } {
  if (sobrante <= 0 || cuantos <= 0) return { antes: 0, entre: 0 }
  switch (como) {
    case 'center':
      return { antes: sobrante / 2, entre: 0 }
    case 'end':
      return { antes: sobrante, entre: 0 }
    case 'between':
      return { antes: 0, entre: cuantos > 1 ? sobrante / (cuantos - 1) : 0 }
    case 'evenly':
      return { antes: sobrante / (cuantos + 1), entre: sobrante / (cuantos + 1) }
    default:
      return { antes: 0, entre: 0 }
  }
}

/** El bloque de texto entero de una sección: la envolvente de todas sus cajas. */
export function bloqueDeTexto(r: RepartoVertical): { readonly arribaPx: number; readonly abajoPx: number } | null {
  if (r.cajas.length === 0) return null
  let arriba = Infinity
  let abajo = -Infinity
  for (const c of r.cajas) {
    arriba = Math.min(arriba, c.arribaPx)
    abajo = Math.max(abajo, c.arribaPx + c.caja.altoPx)
  }
  return { arribaPx: arriba, abajoPx: abajo }
}

// ── LA LECTURA QUE ESTO HABILITA: la superposición DONDE EL TEXTO ESTÁ ──────

/** Una caja de texto pasada a coordenadas de cuadro. `y` = +1 arriba, −1 abajo. */
export function aCuadro(
  c: CajaEnPantalla,
  ancho: number,
  alto: number,
): { readonly x0: number; readonly x1: number; readonly y0: number; readonly y1: number } {
  const y1 = 1 - (2 * c.arribaPx) / alto
  return {
    x0: aCuadroX(c.caja.banda.izquierda, ancho),
    x1: aCuadroX(c.caja.banda.izquierda + c.caja.banda.ancho, ancho),
    y0: y1 - aCuadroAlto(c.caja.altoPx, alto),
    y1,
  }
}

export interface SuperposicionReal {
  /** Celdas de la grilla que caen dentro de alguna caja de texto. */
  readonly area: number
  /** De ésas, cuántas tienen tinta del logo por delante. */
  readonly tapadas: number
  /** La cifra: `tapadas / area`. Es la superposición DONDE EL BLOQUE ESTÁ. */
  readonly fraccion: number
  /** La peor caja individual, con su nombre. La que decide si algo se lee. */
  readonly peor: { readonly etiqueta: string; readonly texto: string; readonly fraccion: number } | null
  /** Caja por caja, en orden de documento. */
  readonly porCaja: readonly { readonly etiqueta: string; readonly texto: string; readonly fraccion: number }[]
}

/**
 * LA SUPERPOSICIÓN EN LA POSICIÓN REAL DEL BLOQUE.
 *
 * ⚠ **La diferencia con `barridoVertical(...).minima` es la pregunta, no el
 * método.** Aquél contesta *«¿existe alguna altura limpia?»* y por eso barre
 * posiciones que el bloque no ocupa; éste contesta *«¿cuánto se superpone?»* y
 * por eso usa UNA, la que el layout produce. Los dos se publican juntos: el
 * primero dice si mover el texto alcanza, el segundo dice cuánto hay que mover.
 */
export function superposicionReal(
  m: MuestraDelLogo,
  reparto: RepartoVertical,
): SuperposicionReal {
  let area = 0
  let tapadas = 0
  const porCaja: { etiqueta: string; texto: string; fraccion: number }[] = []
  for (const c of reparto.cajas) {
    if (c.caja.altoPx <= 0 || c.caja.banda.ancho <= 0) continue
    const caja = aCuadro(c, reparto.ancho, reparto.alto)
    const s = superposicion(m, caja)
    const suArea = celdasEnLaCaja(m, caja)
    area += suArea
    tapadas += s.celdas
    porCaja.push({ etiqueta: c.caja.etiqueta, texto: c.caja.texto, fraccion: suArea === 0 ? 0 : s.celdas / suArea })
  }
  const peor = porCaja.reduce<{ etiqueta: string; texto: string; fraccion: number } | null>(
    (a, b) => (a === null || b.fraccion > a.fraccion ? b : a),
    null,
  )
  return { area, tapadas, fraccion: area === 0 ? Number.NaN : tapadas / area, peor, porCaja }
}

/**
 * UNA COMPOSICIÓN HIPOTÉTICA: el mismo hero con otro `justify-*` en su pantalla.
 *
 * Se le pasa a `repartoVertical` como `clasesDe`. Sirve para dos cosas y las dos
 * son necesarias: poner un número al lado de una palanca antes de moverla, y
 * darle al control positivo la composición de la captura del humano —el bloque
 * CENTRADO sobre el logo— para comprobar que el medidor no la lee como limpia.
 */
export function conDistribucion(
  como: string,
): (clases: readonly string[], nodo: number) => readonly string[] {
  return (clases) =>
    clases.includes('min-h-svh') && clases.includes('flex-col')
      ? [...clases.filter((c) => !c.startsWith('justify-')), `justify-${como}`]
      : clases
}
