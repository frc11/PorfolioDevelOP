/**
 * COMPO-1 · B — EL TAMAÑO QUE ENTRA, DERIVADO Y NO ELEGIDO.
 *
 *     npx tsx scripts-compo/b-ajuste.ts
 *
 * ── Qué contesta ──────────────────────────────────────────────────────────
 *
 * El §1 del sprint pone un requisito DURO: *«LAS 24 HS entra entero en un
 * renglón en TODOS los anchos de 320 a 1024»*, y pide derivar el tamaño que lo
 * cumple en vez de elegirlo. Para derivarlo hacen falta dos números por ancho:
 *
 *   · **la caja** en la que ese renglón tiene que entrar — el ancho de contenido
 *     del `h1`, leído del árbol real;
 *   · **el avance de la cadena en `em`** con la cara, el peso, el estilo y el
 *     interletrado con los que se PINTA.
 *
 * El techo es entonces `caja / avance`, y el tamaño derivado es el mayor entero
 * que no lo pasa. Lo mismo para las dos mitades de la línea 1 —«TU NEGOCIO» y
 * «VENDIENDO»— y para los dos renglones de la bajada del §2.
 *
 * ── ⚠️ EL AVANCE SE MIDE EN LA PÁGINA, NO EN EL `.woff2` ─────────────────
 *
 * `s10-avance.ts` lee `hmtx` del binario y declara tres supuestos: instancia por
 * defecto del eje de peso, sin kerning y **la línea 2 se mide con la Chivo
 * ROMANA porque el nivel no sabe de estilo** (su propio docblock lo dice). Los
 * tres empujan para el lado del piso, que está bien para afirmar «entra» y está
 * mal para DERIVAR un techo: un techo derivado de un avance subestimado no
 * entra.
 *
 * Acá el avance sale de una medición en el navegador: se clona el estilo
 * computado de la pieza real —familia, peso, estilo, interletrado en `em`,
 * `text-transform`— sobre un elemento fuera de pantalla con `white-space:
 * nowrap`, a un tamaño de referencia grande, y se divide. Lo que se obtiene es
 * el avance CON la cara que se pinta, con su itálica y con su kerning.
 *
 * ⚠ El tamaño de referencia es 200 px y no 1 px: el navegador redondea el ancho
 * de un `ClientRect` a fracciones, y dividir por un tamaño grande deja el error
 * relativo por debajo de 1e-4. El resultado se publica en `em`.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { medir, scrollA, type Pagina } from '../scripts-b4/navegador'
import {
  ASENTAMIENTO_MS,
  VENTANAS,
  argumento,
  asegurarCarpetas,
  conChrome,
  enLaVentana,
  type Ventana,
} from '../scripts-tapado/tapado-comun'
import { RAIZ_DE_SALIDAS, dos } from './compo-comun'

/** El breakpoint `escritorio`. Arriba de él este sprint no toca el titular. */
const ESCRITORIO_PX = 1025

/**
 * LAS CADENAS QUE HAY QUE HACER ENTRAR, cada una con la pieza de la que hereda
 * su estilo. La pieza se nombra por selector y no se transcribe su tipografía:
 * medir con un estilo copiado a mano es medir otra cosa.
 */
const CADENAS = [
  { clave: 'L1a', texto: 'Tu negocio', estiloDe: 'linea1' },
  { clave: 'L1b', texto: 'vendiendo', estiloDe: 'linea1' },
  { clave: 'L1entera', texto: 'Tu negocio vendiendo', estiloDe: 'linea1' },
  { clave: 'L2', texto: 'las 24 hs', estiloDe: 'linea2' },
  { clave: 'Bajada1', texto: 'Tu sitio, tu chat', estiloDe: 'bajada' },
  { clave: 'Bajada2', texto: 'y tu seguimiento.', estiloDe: 'bajada' },
  { clave: 'BajadaEntera', texto: 'Tu sitio, tu chat y tu seguimiento.', estiloDe: 'bajada' },
] as const

const REFERENCIA_PX = 200

function LECTOR_DE_AVANCES(cadenas: readonly { clave: string; texto: string; estiloDe: string }[]): string {
  return `(() => {
  const pantalla = document.querySelector('[data-pantalla="hero"]')
  if (pantalla === null) return null
  const h1 = pantalla.querySelector('h1')
  const lineas = h1 === null ? [] : [...h1.children]
  const fuentes = {
    linea1: lineas[0] ?? null,
    linea2: lineas[lineas.length - 1] ?? null,
    bajada:
      pantalla.querySelector('[data-nivel="cuerpo"]') ??
      pantalla.querySelector('[data-nivel="base"]') ??
      pantalla.querySelector('p'),
  }
  const banco = document.createElement('div')
  banco.style.cssText = 'position:absolute;left:-99999px;top:0;visibility:hidden;white-space:nowrap;'
  document.body.appendChild(banco)
  const salida = []
  for (const c of ${JSON.stringify(cadenas)}) {
    const fuente = fuentes[c.estiloDe]
    if (fuente === null || fuente === undefined) { salida.push({ clave: c.clave, avanceEm: null, motivo: 'la pieza de la que hereda no esta en el arbol' }); continue }
    const s = getComputedStyle(fuente)
    const tamanoReal = parseFloat(s.fontSize)
    const interletradoPx = parseFloat(s.letterSpacing)
    // El interletrado del sistema va en \`em\`, así que se reconstruye como razón
    // del tamaño REAL y se vuelve a aplicar al de referencia. Un valor en px
    // copiado tal cual convertiría una razón en una constante.
    const interletradoEm = Number.isFinite(interletradoPx) && tamanoReal > 0 ? interletradoPx / tamanoReal : 0
    const sonda = document.createElement('span')
    sonda.style.fontFamily = s.fontFamily
    sonda.style.fontWeight = s.fontWeight
    sonda.style.fontStyle = s.fontStyle
    sonda.style.fontStretch = s.fontStretch
    sonda.style.fontVariationSettings = s.fontVariationSettings
    sonda.style.textTransform = s.textTransform
    sonda.style.fontSize = ${REFERENCIA_PX} + 'px'
    sonda.style.letterSpacing = (interletradoEm * ${REFERENCIA_PX}) + 'px'
    sonda.style.whiteSpace = 'nowrap'
    sonda.textContent = c.texto
    banco.appendChild(sonda)
    const r = sonda.getBoundingClientRect()
    salida.push({
      clave: c.clave,
      texto: c.texto,
      estiloDe: c.estiloDe,
      familia: s.fontFamily,
      peso: s.fontWeight,
      estilo: s.fontStyle,
      transformacion: s.textTransform,
      interletradoEm,
      tamanoReal,
      anchoDeReferencia: r.width,
      avanceEm: r.width / ${REFERENCIA_PX},
    })
    sonda.remove()
  }
  banco.remove()
  const cajaDelTitular = h1 === null ? null : h1.getBoundingClientRect().width
  const bajadaEl = fuentes.bajada
  // La caja de la bajada NO es su rectángulo: \`items-start\` la encoge a su
  // contenido. La que manda es la de su PADRE, que es la celda de la grilla.
  const cajaDeLaBajada = bajadaEl === null || bajadaEl.parentElement === null
    ? null
    : bajadaEl.parentElement.getBoundingClientRect().width
  return { ventana: window.innerWidth, cajaDelTitular, cajaDeLaBajada, avances: salida }
})()`
}

interface Avance {
  readonly clave: string
  readonly texto?: string
  readonly estiloDe?: string
  readonly familia?: string
  readonly peso?: string
  readonly estilo?: string
  readonly transformacion?: string
  readonly interletradoEm?: number
  readonly tamanoReal?: number
  readonly anchoDeReferencia?: number
  readonly avanceEm: number | null
  readonly motivo?: string
}

interface LecturaDeAvances {
  readonly ventana: number
  readonly cajaDelTitular: number | null
  readonly cajaDeLaBajada: number | null
  readonly avances: readonly Avance[]
}

async function medirVentana(pagina: Pagina, v: Ventana): Promise<unknown> {
  await scrollA(pagina, 0)
  await medir<boolean>(pagina, `(async () => { await new Promise((r) => setTimeout(r, 600)); return true })()`)
  const lectura = await medir<LecturaDeAvances | null>(pagina, LECTOR_DE_AVANCES(CADENAS))
  if (lectura === null) throw new Error(`a ${v.ancho}: el lector no encontro el hero`)

  const caja = (clave: string): number | null =>
    clave.startsWith('Bajada') ? lectura.cajaDeLaBajada : lectura.cajaDelTitular

  const derivadas = lectura.avances.map((a) => {
    const c = caja(a.clave)
    if (a.avanceEm === null || c === null) {
      return { ...a, caja: c, techoPx: null, mayorEnteroQueEntra: null, anchoDeHoy: null, entraHoy: null }
    }
    const techo = c / a.avanceEm
    return {
      ...a,
      interletradoEm: a.interletradoEm === undefined ? null : Number(a.interletradoEm.toFixed(5)),
      avanceEm: Number(a.avanceEm.toFixed(5)),
      anchoDeReferencia: a.anchoDeReferencia === undefined ? null : dos(a.anchoDeReferencia),
      caja: dos(c),
      /** El tamaño exacto al que la cadena llena la caja. */
      techoPx: dos(techo),
      mayorEnteroQueEntra: Math.floor(techo),
      /** Lo que la cadena mide HOY, al tamaño con el que se pinta. */
      anchoDeHoy: a.tamanoReal === undefined ? null : dos(a.tamanoReal * a.avanceEm),
      entraHoy: a.tamanoReal === undefined ? null : a.tamanoReal * a.avanceEm <= c,
    }
  })

  console.log(`    caja del titular ${dos(lectura.cajaDelTitular ?? 0)} px · caja de la bajada ${dos(lectura.cajaDeLaBajada ?? 0)} px`)
  for (const d of derivadas) {
    console.log(
      `      ${d.clave.padEnd(13)} avance ${String(d.avanceEm).padStart(8)} em · ` +
        `hoy ${String(d.tamanoReal ?? 0).padStart(6)} px = ${String(d.anchoDeHoy).padStart(7)} px ` +
        `${d.entraHoy === true ? 'ENTRA' : 'NO ENTRA'} · techo ${String(d.techoPx).padStart(7)} px → entero ${d.mayorEnteroQueEntra}`,
    )
  }

  return {
    ancho: v.ancho,
    alto: v.alto,
    debajoDeEscritorio: v.ancho < ESCRITORIO_PX,
    cajaDelTitular: dos(lectura.cajaDelTitular ?? 0),
    cajaDeLaBajada: dos(lectura.cajaDeLaBajada ?? 0),
    cadenas: derivadas,
  }
}

async function main(): Promise<void> {
  asegurarCarpetas()
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const etiqueta = argumento('etiqueta', 'hoy')
  const soloAncho = argumento('ancho', '')
  const ventanas = soloAncho === '' ? VENTANAS : VENTANAS.filter((v) => String(v.ancho) === soloAncho)
  if (ventanas.length === 0) throw new Error(`ningun ancho coincide con --ancho=${soloAncho}`)

  const filas: unknown[] = []
  for (const v of ventanas) {
    console.log(`\n  ${v.ancho}x${v.alto}`)
    filas.push(
      await conChrome(`compo-ajuste-${v.ancho}`, async (chrome) =>
        enLaVentana(chrome, v, async ({ pagina }) => medirVentana(pagina, v), { asentamientoMs: ASENTAMIENTO_MS }),
      ),
    )
  }

  const ruta = path.join(RAIZ_DE_SALIDAS, `b-ajuste-${etiqueta}.json`)
  writeFileSync(
    ruta,
    `${JSON.stringify(
      {
        etiqueta,
        cuando: new Date().toISOString(),
        instrumento:
          'scripts-compo/b-ajuste.ts — el avance en em de cada cadena MEDIDO en el navegador con el estilo computado de la pieza real (cara, peso, estilo, interletrado en em y text-transform), y el techo de tamano que sale de dividir la caja por ese avance',
        referenciaPx: REFERENCIA_PX,
        filas,
      },
      null,
      2,
    )}\n`,
    'utf8',
  )
  console.log(`\n  -> ${ruta}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
