/**
 * DÓNDE CAE CADA CAJA DE TEXTO DENTRO DE LA PANTALLA — el reparto horizontal,
 * derivado del sistema de layout y no escrito a mano.
 *
 * ⚠ **Este archivo NO se escanea por tokens.** Los únicos números literales son
 * índices de grilla y el `0.5` del centro de una celda; cada medida sale de
 * `tokenPx` sobre `theme-develop.css`.
 *
 * ── Por qué un mini-repartidor y no cuatro números escritos ────────────────
 *
 * Porque el ancho de la columna del titular del Hero **no es un dato**: es la
 * consecuencia de cuatro decisiones que viven en cuatro archivos distintos —el
 * padding fijo de `Envoltorio`, el tope de contenido, la grilla `lateral` con su
 * columna de 140 y la grilla de 5 con `col-span-3`—. Escribir el resultado a
 * mano lo desconecta de las cuatro: el día que una cambie, la cifra publicada
 * sigue diciendo lo mismo y ya no es cierta. Acá se recorre el **marcado que el
 * banco renderiza** y se reparte el ancho con las reglas que las clases emitidas
 * declaran.
 *
 * ── QUÉ MODELA, exactamente ───────────────────────────────────────────────
 *
 *   · `px-[var(--t)]`, `pl-[var(--t)]`, `pr-[var(--t)]` → padding lateral.
 *   · `max-w-tope` + `mx-auto` → el tope del contenido, centrado.
 *   · `grid` + `grid-cols-N` → N columnas iguales con la canaleta de `gap-[…]`.
 *   · `grid-cols-[var(--columna-lateral)_minmax(0,1fr)]` → fija + resto.
 *   · `col-span-N` en un hijo → cuántas columnas ocupa, con su corte de fila.
 *
 * Todas se leen **después** de `clasesEfectivas`, o sea con las variantes de
 * ancho ya resueltas contra el viewport: `escritorio:grid-cols-5` existe a 1025
 * y no a 1024, que es la conmutación medida del sistema.
 *
 * ── ⚠ LOS SUPUESTOS, declarados (regla 10: esto es CÁLCULO, no medición) ───
 *
 * Están en `SUPUESTOS_DE_LAS_CAJAS` y se imprimen al lado de toda cifra. El más
 * grande es el vertical: **este archivo no decide a qué altura de la pantalla
 * cae un bloque.** Da el ancho de su banda y el alto que su texto ocupa; quién
 * mide la superposición barre la posición vertical entera (`barridoVertical`) y
 * publica el rango, en vez de inventar una.
 */

import { NIVELES_TIPOGRAFICOS, type Nivel } from '../../tipografia'
import { marcadoDeSeccion } from '../../__tests__/s10-banco'
import { clasesEfectivas, tokenPx, valorDeToken } from '../../__tests__/s10-css'
import { FUENTE_CODIGO, FUENTE_TITULO, lineasDeTexto } from '../../__tests__/s10-avance'
import { leerAvancesDe } from '../../__tests__/s10-woff2'
import { atributo, nodosDe, textoDe, type Nodo } from '../../__tests__/s10-recorrido'

/** Una banda horizontal en píxeles de viewport. */
export interface BandaPx {
  readonly izquierda: number
  readonly ancho: number
}

export interface CajaMedida {
  readonly etiqueta: string
  readonly texto: string
  readonly clases: string
  /** La banda de CONTENIDO del elemento: donde el texto puede cortar. */
  readonly banda: BandaPx
  readonly tamanoPx: number
  readonly interlineado: number
  /** El interletrado en `em`, ya resuelto. Se expone para poder recortar la medida. */
  readonly interletradoEm: number
  /** El `.woff2` con el que se midió. Idem: para recontar líneas a otro ancho. */
  readonly fuente: string
  readonly lineas: number
  /** Alto del bloque de texto: líneas × caja de línea. */
  readonly altoPx: number
}

export const SUPUESTOS_DE_LAS_CAJAS: readonly string[] = [
  'el reparto horizontal es exacto para grillas; un contenedor `flex` da a sus hijos el ancho entero, así que `items-start` —que encoge— sobreestima la caja del CTA, y sobreestimar la caja sobreestima la superposición: es el lado conservador',
  'el alto de una caja es `líneas × tamaño × interlineado`; no modela márgenes, `gap` entre cajas ni el descuelgue de la última línea',
  'las líneas salen de `lineasDeTexto`, que usa la instancia POR DEFECTO de la fuente variable: un texto en peso medio o fuerte es más ancho, así que el conteo es un PISO',
  'la posición VERTICAL del bloque no se deriva: quien mide barre todas las posiciones que caben en la pantalla y publica el rango',
  'el viewport de CSS no descuenta la barra de scroll, y el canvas es `fixed inset-0`, así que el cuadro de la escena mide exactamente el viewport',
]

/** Las clases de tamaño del sistema, derivadas de la tabla de niveles. */
const TAMANOS: ReadonlyMap<string, Nivel> = new Map(
  Object.entries(NIVELES_TIPOGRAFICOS).flatMap(([nivel, d]) =>
    [d.claseFija, d.claseFluida]
      .filter((c): c is string => c !== null)
      .map((c) => [c, nivel as Nivel] as const),
  ),
)

const RE_PAD = /^p([xlr])-\[var\((--[a-z0-9-]+)\)\]$/
const RE_GAP = /^gap-\[var\((--[a-z0-9-]+)\)\]$/
const RE_LATERAL = /^grid-cols-\[var\((--[a-z0-9-]+)\)_minmax\(0,1fr\)\]$/

function ultima(clases: readonly string[], prueba: (c: string) => boolean): string | undefined {
  for (let i = clases.length - 1; i >= 0; i -= 1) if (prueba(clases[i])) return clases[i]
  return undefined
}

/** El reparto de columnas de un contenedor de grilla, o `null` si no lo es. */
function plantilla(
  clases: readonly string[],
  interno: number,
  ancho: number,
): { readonly columnas: readonly number[]; readonly gap: number } | null {
  if (!clases.includes('grid')) return null
  const cols = ultima(clases, (c) => c.startsWith('grid-cols-'))
  if (cols === undefined) return null
  const claseDeGap = ultima(clases, (c) => RE_GAP.test(c))
  const gap = claseDeGap === undefined ? 0 : tokenPx(RE_GAP.exec(claseDeGap)![1], ancho)

  const lateral = RE_LATERAL.exec(cols)
  if (lateral !== null) {
    const fija = tokenPx(lateral[1], ancho)
    return { columnas: [fija, interno - fija - gap], gap }
  }
  const n = Number.parseInt(cols.slice('grid-cols-'.length), 10)
  if (!Number.isFinite(n) || n < 1) return null
  const w = (interno - gap * (n - 1)) / n
  return { columnas: Array.from({ length: n }, () => w), gap }
}

/** La caja de contenido de un elemento: su banda menos el padding que declara. */
function contenidoDe(banda: BandaPx, clases: readonly string[], ancho: number): BandaPx {
  let izquierda = banda.izquierda
  let w = banda.ancho
  for (const clase of clases) {
    const m = RE_PAD.exec(clase)
    if (m === null) continue
    const p = tokenPx(m[2], ancho)
    if (m[1] === 'x') {
      izquierda += p
      w -= 2 * p
    } else if (m[1] === 'l') {
      izquierda += p
      w -= p
    } else {
      w -= p
    }
  }
  return { izquierda, ancho: w }
}

/** El tope de ancho del propio elemento, centrado si lleva `mx-auto`. */
function conTope(banda: BandaPx, clases: readonly string[], ancho: number): BandaPx {
  if (!clases.includes('max-w-tope')) return banda
  const w = Math.min(banda.ancho, tokenPx('--container-tope', ancho))
  const izquierda = clases.includes('mx-auto')
    ? banda.izquierda + (banda.ancho - w) / 2
    : banda.izquierda
  return { izquierda, ancho: w }
}

/** El interletrado en `em` de una clase `tracking-*`. 0 si no declara ninguna. */
function interletradoEm(clases: readonly string[]): number {
  const clase = ultima(clases, (c) => c.startsWith('tracking-'))
  if (clase === undefined) return 0
  const crudo = valorDeToken(`--${clase}`).trim()
  const m = /^(-?[\d.]+)em$/.exec(crudo)
  return m === null ? 0 : Number.parseFloat(m[1])
}

/**
 * RECORRE UNA SECCIÓN Y DEVUELVE SUS CAJAS DE TEXTO CON BANDA Y ALTO.
 *
 * ⚠ **No usa `cajasDeTexto` del banco, y el motivo FUE un hallazgo de este
 * frente.** Aquél filtraba sólo por `data-nivel`, que emiten `Titular` y
 * `Textos`; **el titular del Hero no lo lleva** —lo dibuja `TextoPorLineas` con
 * su clase pasada a mano—, así que la caja más grande de la sección que este
 * frente tiene que medir era invisible para ese extractor. Acá se filtra por
 * **clase de tamaño**, que es lo que decide la caja de línea, y las dos formas
 * de escribir un texto quedan adentro.
 *
 * ✅ **La integración de SITIO-S10 arregló el banco con este hallazgo**:
 * `cajasDeTexto` ahora deduce el nivel de la utilidad de tamaño cuando no hay
 * `data-nivel`, y cada caja dice por qué vía se supo (`via: 'atributo' |
 * 'clase'`). Este lector se queda igual y no es duplicación: **además reparte
 * la banda horizontal y resuelve el anidamiento**, que es lo que necesita medir
 * una superposición y el banco no hace. Que los dos vean hoy las mismas cajas
 * es lo que lo vuelve comprobable, no lo que lo vuelve redundante.
 *
 * De dos cajas anidadas se conserva la de adentro: el `<a>` del CTA declara
 * `text-base` y su `<span>` interno `text-cuerpo`, y contar las dos duplicaría
 * el área del mismo texto.
 */
export function cajasDeLaSeccion(id: string, ancho: number): CajaMedida[] {
  const html = marcadoDeSeccion(id, 'quieta')
  const nodos = nodosDe(html)
  const clasesDe = (n: Nodo): string[] => clasesEfectivas(atributo(n, 'class') ?? '', ancho)

  // El padre de cada nodo: el último anterior con una profundidad menos.
  const padre = new Array<number>(nodos.length).fill(-1)
  const pila: number[] = []
  for (let i = 0; i < nodos.length; i += 1) {
    while (pila.length > 0 && nodos[pila[pila.length - 1]].profundidad >= nodos[i].profundidad) {
      pila.pop()
    }
    padre[i] = pila.length === 0 ? -1 : pila[pila.length - 1]
    pila.push(i)
  }
  const hijos = nodos.map((): number[] => [])
  for (let i = 0; i < nodos.length; i += 1) if (padre[i] >= 0) hijos[padre[i]].push(i)

  // El reparto, de la raíz hacia adentro. La raíz ocupa el viewport entero.
  const interno = new Array<BandaPx>(nodos.length).fill({ izquierda: 0, ancho })
  const asignar = (i: number, banda: BandaPx): void => {
    const clases = clasesDe(nodos[i])
    const propia = conTope(banda, clases, ancho)
    const dentro = contenidoDe(propia, clases, ancho)
    interno[i] = dentro

    const grilla = plantilla(clases, dentro.ancho, ancho)
    let cursor = 0
    for (const h of hijos[i]) {
      if (grilla === null) {
        asignar(h, dentro)
        continue
      }
      const clasesDelHijo = clasesDe(nodos[h])
      const claseDeSpan = ultima(clasesDelHijo, (c) => /^col-span-\d+$/.test(c))
      const span = Math.min(
        grilla.columnas.length,
        claseDeSpan === undefined ? 1 : Number.parseInt(claseDeSpan.slice('col-span-'.length), 10),
      )
      if (cursor + span > grilla.columnas.length) cursor = 0
      let izquierda = dentro.izquierda
      for (let c = 0; c < cursor; c += 1) izquierda += grilla.columnas[c] + grilla.gap
      let w = grilla.gap * (span - 1)
      for (let c = cursor; c < cursor + span; c += 1) w += grilla.columnas[c]
      cursor += span
      asignar(h, { izquierda, ancho: w })
    }
  }
  const raiz = nodos.findIndex((_, i) => padre[i] === -1)
  if (raiz >= 0) asignar(raiz, { izquierda: 0, ancho })

  // Las cajas: las que declaran una clase de tamaño y no contienen otra igual.
  const candidatos = nodos
    .map((n, i) => ({ n, i, clases: clasesDe(n) }))
    .filter((c) => c.clases.some((k) => TAMANOS.has(k)))
    .filter((c) => textoDe(html, c.n).trim().length > 0)

  return candidatos
    .filter((c) => !candidatos.some((o) => o !== c && o.n.desde >= c.n.desde && o.n.hasta <= c.n.hasta))
    .map(({ n, i, clases }): CajaMedida => {
      const claseDeTamano = ultima(clases, (k) => TAMANOS.has(k))!
      const nivel = TAMANOS.get(claseDeTamano)!
      const token = claseDeTamano.startsWith('text-fluido-')
        ? `--text-fluido-${claseDeTamano.slice('text-fluido-'.length)}`
        : `--text-${claseDeTamano.slice('text-'.length)}`
      const claseDeLeading = ultima(clases, (k) => k.startsWith('leading-'))
      const interlineado = tokenPx(
        claseDeLeading === undefined
          ? `--leading-${NIVELES_TIPOGRAFICOS[nivel].interlineado}`
          : `--${claseDeLeading}`,
        ancho,
      )
      const tamanoPx = tokenPx(token, ancho)
      const texto = textoDe(html, n)
      const fuente = clases.includes('font-codigo') ? FUENTE_CODIGO : FUENTE_TITULO
      const tracking = interletradoEm(clases)
      const lineas = lineasDeTexto(leerAvancesDe(fuente), texto, interno[i].ancho, tamanoPx, tracking)
      return {
        etiqueta: n.etiqueta,
        texto,
        clases: clases.join(' '),
        banda: interno[i],
        tamanoPx,
        interlineado,
        interletradoEm: tracking,
        fuente,
        lineas,
        altoPx: lineas * tamanoPx * interlineado,
      }
    })
}

/** Una coordenada horizontal en píxeles, pasada a coordenada de cuadro (−1…1). */
export function aCuadroX(px: number, ancho: number): number {
  return (2 * px) / ancho - 1
}

/** Un alto en píxeles, pasado a la unidad vertical del cuadro (el cuadro mide 2). */
export function aCuadroAlto(px: number, alto: number): number {
  return (2 * px) / alto
}
