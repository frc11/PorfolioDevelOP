/**
 * TEXTO-1 · B — LAS PALANCAS DEL TEXTO, UNA POR UNA, con lo que da cada una.
 *
 *     npx tsx scripts-texto/b-palancas.ts --etiqueta=hoy
 *     npx tsx scripts-texto/b-palancas.ts --etiqueta=hoy --ancho=768
 *
 * Contesta el PASO 2: cuántos píxeles baja el bloque cada palanca POR SEPARADO,
 * en los ocho anchos. No elige: publica la tabla.
 *
 * ── LOS UMBRALES DE ENVOLVIMIENTO SE MIDEN, NO SE BARREN ─────────────────
 *
 * Un barrido de tamaños encuentra el escalón donde una línea deja de envolver,
 * pero lo encuentra con la resolución del paso y gasta una medición por valor.
 * Acá se mide **el ancho de la pieza sin envolver** (`white-space: nowrap`) y se
 * divide por su tamaño: eso da el avance real de la cara en píxeles por píxel de
 * cuerpo, y con la caja medida el umbral sale EXACTO y de una sola lectura. El
 * barrido queda igual —hace falta para el ALTO, que no es proporcional— pero ya
 * no es el que decide dónde está el escalón.
 *
 * ⚠ El avance que sale de acá NO es el de `geometria.ts` (8,5670 em − 19 ×
 * 0,02). Aquél es el modelo conservador con el que se DERIVÓ el 58; éste es lo
 * que el navegador dibuja. La diferencia es del orden de 1 px en 474 y va para
 * el lado seguro. Los dos se publican.
 *
 * ── LA CURVA, NO EL TAMAÑO ────────────────────────────────────────────────
 *
 * Las palancas (a) y (b) no son «poner el titular en 31 px»: son **mover el piso
 * de la curva fluida**. Así que el barrido va sobre el PISO —el valor a 375— y
 * de ahí se deriva el tamaño en cada ancho con la recta que sigue pasando por su
 * ancla de 1440. Es la forma que el sprint pide y la única que deja ver el costo
 * en los anchos que no son el que se está arreglando.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { medir, scrollA, type Pagina } from '../scripts-b4/navegador'
import {
  ASENTAMIENTO_MS,
  VENTANAS,
  argumento,
  conChrome,
  enLaVentana,
} from '../scripts-tapado/tapado-comun'
import {
  HOJA_DE_PALANCAS,
  LECTOR,
  RAIZ_DE_SALIDAS,
  dos,
  finDeLaMasaDelLogo,
  type Desglose,
} from './texto-comun'

/** Las dos anclas de la banda fluida del tema. No se tocan. */
const PISO_DE_LA_BANDA = 375
const ANCLA_DE_LA_BANDA = 1440
const TOPE_DE_LA_BANDA = 1920

/** El tamaño que una curva con ese piso da en un ancho, con el ancla fija. */
function deLaCurva(piso: number, ancla: number, ancho: number): number {
  const a = (ancla - piso) / (ANCLA_DE_LA_BANDA - PISO_DE_LA_BANDA)
  const b = ancla - a * ANCLA_DE_LA_BANDA
  const techo = b + a * TOPE_DE_LA_BANDA
  return Math.min(Math.max(piso, b + a * ancho), techo)
}

/** Las anclas de hoy, leídas del tema por su valor conocido y afirmadas abajo. */
const ANCLA_L1 = 58
const ANCLA_L2 = 104

const SEL_L1 = '[data-pantalla="hero"] h1 > span:nth-of-type(1)'
const SEL_L2 = '[data-pantalla="hero"] h1 > span:nth-of-type(2)'
const SEL_SPANS = '[data-pantalla="hero"] h1 > span'
const SEL_BAJADA = '[data-pantalla="hero"] [data-nivel="cuerpo"]'
const SEL_PANTALLA = '[data-pantalla="hero"]'
const SEL_COLUMNA = '[data-pantalla="hero"] div[class*="gap-8"]'
const SEL_BLOQUE_P2 = '[data-pantalla="hero"] div[class*="gap-6"]'

interface Candidato {
  readonly clave: string
  readonly palanca: string
  readonly que: string
  readonly regla: (ancho: number) => string
}

/** Pone la hoja, espera un cuadro y lee. Una palanca por vez, siempre desde cero. */
function PROBAR(regla: string): string {
  return `(async () => {
  const id = ${JSON.stringify(HOJA_DE_PALANCAS)}
  let hoja = document.getElementById(id)
  if (hoja === null) { hoja = document.createElement('style'); hoja.id = id; document.head.appendChild(hoja) }
  hoja.textContent = ${JSON.stringify(regla)}
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  return ${LECTOR}
})()`
}

/** El ancho de una pieza SIN envolver, y su tamaño, para sacar el avance. */
function SIN_ENVOLVER(selector: string): string {
  return `(async () => {
  const id = ${JSON.stringify(HOJA_DE_PALANCAS)}
  let hoja = document.getElementById(id)
  if (hoja === null) { hoja = document.createElement('style'); hoja.id = id; document.head.appendChild(hoja) }
  hoja.textContent = ${JSON.stringify(`${selector}{white-space:nowrap!important;width:max-content!important;max-width:none!important}`)}
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  const el = document.querySelector(${JSON.stringify(selector)})
  if (el === null) return null
  const rango = document.createRange()
  rango.selectNodeContents(el)
  const rects = [...rango.getClientRects()].filter((r) => r.width > 0.5)
  const s = getComputedStyle(el)
  hoja.textContent = ''
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  return {
    ancho: rects.length === 0 ? 0 : Math.max(...rects.map((r) => r.width)),
    renglones: rects.length,
    fontSize: parseFloat(s.fontSize),
  }
})()`
}

interface SinEnvolver {
  readonly ancho: number
  readonly renglones: number
  readonly fontSize: number
}

function candidatos(): readonly Candidato[] {
  const lista: Candidato[] = []
  lista.push({
    clave: 'base',
    palanca: '—',
    que: 'el arbol como esta hoy, sin una sola regla puesta',
    regla: () => '',
  })

  // (a) el titular mas chico en anchos angostos — se mueve el PISO de la curva.
  for (const piso of [36, 35, 34, 33, 32, 31.5, 31, 30, 29, 28, 27, 26, 25, 24]) {
    lista.push({
      clave: `a-piso-L1-${piso}`,
      palanca: 'a) titular (linea 1) — piso de la curva fluida',
      que: `piso ${piso}px a 375, ancla ${ANCLA_L1}px a 1440 sin mover`,
      regla: (ancho) => `${SEL_L1}{font-size:${deLaCurva(piso, ANCLA_L1, ancho).toFixed(4)}px!important}`,
    })
  }

  // (b) la linea 2 mas chica — idem, con su propia curva.
  for (const piso of [66, 64, 62, 60, 58, 56, 55, 54, 52, 50, 48, 46, 44]) {
    lista.push({
      clave: `b-piso-L2-${piso}`,
      palanca: 'b) linea 2 — piso de la curva fluida',
      que: `piso ${piso}px a 375, ancla ${ANCLA_L2}px a 1440 sin mover`,
      regla: (ancho) => `${SEL_L2}{font-size:${deLaCurva(piso, ANCLA_L2, ancho).toFixed(4)}px!important}`,
    })
  }

  // (c) el interlineado del titular.
  for (const li of [1.05, 1.0, 0.95, 0.9, 0.85]) {
    lista.push({
      clave: `c-interlineado-${li}`,
      palanca: 'c) interlineado del titular',
      que: `leading ${li} en los dos registros (hoy --leading-titulo = 1,09)`,
      regla: () => `${SEL_SPANS}{line-height:${li}!important}`,
    })
  }

  // (d) el relleno de arriba y de abajo.
  for (const [pt, pb] of [
    [0, 80],
    [40, 80],
    [80, 72],
    [80, 40],
    [80, 0],
    [0, 0],
  ] as const) {
    lista.push({
      clave: `d-relleno-${pt}-${pb}`,
      palanca: 'd) pt-20 / pb-20',
      que: `padding-top ${pt}px · padding-bottom ${pb}px (hoy 80 y 80)`,
      regla: () => `${SEL_PANTALLA}{padding-top:${pt}px!important;padding-bottom:${pb}px!important}`,
    })
  }

  // (e) la bajada en UNA linea. `nowrap` no acorta el texto: lo deja salirse de
  // la caja. Para el ALTO del bloque —que es lo que se esta midiendo— da
  // exactamente lo que daria una bajada mas corta, y se declara asi.
  lista.push({
    clave: 'e-bajada-una-linea',
    palanca: 'e) la bajada en UNA linea',
    que: 'white-space:nowrap — simula una bajada que entra; el ancho se sale de la caja y no se mira',
    regla: () => `${SEL_BAJADA}{white-space:nowrap!important}`,
  })

  // FUERA DE LA LISTA DE LA INSTRUCCION — los dos huecos declarados. Se miden
  // porque son parte del alto y el PASO 1 los pide desglosados; NO se aplican.
  for (const g of [24, 16, 8]) {
    lista.push({
      clave: `x-hueco-titular-bajada-${g}`,
      palanca: 'x) FUERA DE LA LISTA — hueco titular/bajada (gap-8 = 32px)',
      que: `gap ${g}px`,
      regla: () => `${SEL_COLUMNA}{gap:${g}px!important}`,
    })
  }
  for (const g of [16, 8]) {
    lista.push({
      clave: `x-hueco-bajada-cta-${g}`,
      palanca: 'x) FUERA DE LA LISTA — hueco bajada/CTA (gap-6 = 24px)',
      que: `gap ${g}px`,
      regla: () => `${SEL_BLOQUE_P2}{gap:${g}px!important}`,
    })
  }
  return lista
}

interface Resultado {
  readonly clave: string
  readonly palanca: string
  readonly que: string
  readonly altoDelBloque: number | null
  readonly bajaPx: number | null
  readonly fsL1: number
  readonly fsL2: number
  readonly renglonesL1: number
  readonly renglonesL2: number
  readonly renglonesBajada: number
  readonly topeDelBloque: number | null
  readonly sobraHastaElBorde: number | null
  readonly sobraConPbIntacto: number | null
}

async function medirVentana(
  pagina: Pagina,
  ancho: number,
  alto: number,
  huecoHastaElBorde: number,
): Promise<{ readonly avances: Record<string, SinEnvolver | null>; readonly resultados: readonly Resultado[] }> {
  await scrollA(pagina, 0)
  await medir<boolean>(pagina, `(async () => { await new Promise((r) => setTimeout(r, 900)); return true })()`)

  const avances: Record<string, SinEnvolver | null> = {
    linea1: await medir<SinEnvolver | null>(pagina, SIN_ENVOLVER(SEL_L1)),
    linea2: await medir<SinEnvolver | null>(pagina, SIN_ENVOLVER(SEL_L2)),
    bajada: await medir<SinEnvolver | null>(pagina, SIN_ENVOLVER(SEL_BAJADA)),
  }

  const resultados: Resultado[] = []
  let base: number | null = null
  for (const c of candidatos()) {
    const d = await medir<Desglose | null>(pagina, PROBAR(c.regla(ancho)))
    if (d === null) throw new Error(`a ${ancho}: el lector no encontro el hero con «${c.clave}»`)
    const h = d.bloque?.alto ?? null
    if (c.clave === 'base') base = h
    resultados.push({
      clave: c.clave,
      palanca: c.palanca,
      que: c.que,
      altoDelBloque: h === null ? null : dos(h),
      bajaPx: h === null || base === null ? null : dos(base - h),
      fsL1: dos(d.linea1.fontSize),
      fsL2: dos(d.linea2.fontSize),
      renglonesL1: d.linea1.renglones?.cantidad ?? 0,
      renglonesL2: d.linea2.renglones?.cantidad ?? 0,
      renglonesBajada: d.bajada.renglones?.cantidad ?? 0,
      topeDelBloque: d.bloque === null ? null : dos(d.bloque.y),
      sobraHastaElBorde: h === null ? null : dos(h - huecoHastaElBorde),
      sobraConPbIntacto: h === null ? null : dos(h - (huecoHastaElBorde - d.relleno.abajo)),
    })
  }
  // La hoja se saca: la pestaña se cierra igual, pero dejarla puesta seria
  // dejar el banco sucio para cualquier lectura posterior sobre esta pagina.
  await medir<Desglose | null>(pagina, PROBAR(''))
  void alto
  return { avances, resultados }
}

async function main(): Promise<void> {
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const etiqueta = argumento('etiqueta', 'sin-etiqueta')
  const soloAncho = argumento('ancho', '')
  const ventanas = soloAncho === '' ? VENTANAS : VENTANAS.filter((v) => String(v.ancho) === soloAncho)
  if (ventanas.length === 0) throw new Error(`ningun ancho coincide con --ancho=${soloAncho}`)

  const masa = finDeLaMasaDelLogo('hoy')
  const filas: unknown[] = []

  for (const v of ventanas) {
    const m = masa.find((x) => x.ancho === v.ancho)
    if (m === undefined) throw new Error(`no hay medicion de la masa del logo a ${v.ancho}`)
    const { avances, resultados } = await conChrome(`texto-b-${v.ancho}`, async (chrome) =>
      enLaVentana(chrome, v, async ({ pagina }) => medirVentana(pagina, v.ancho, v.alto, m.huecoHastaElBorde), {
        asentamientoMs: ASENTAMIENTO_MS,
      }),
    )
    filas.push({ ancho: v.ancho, alto: v.alto, masaDelLogo: m, avances, resultados })
    const base = resultados.find((r) => r.clave === 'base')
    console.log(
      `  ${String(v.ancho).padStart(4)}x${String(v.alto).padEnd(4)}  base ${String(base?.altoDelBloque ?? 'n/d').padStart(7)} px` +
        `  · hueco ${String(m.huecoHastaElBorde).padStart(4)} px  · sobra ${String(base?.sobraHastaElBorde ?? 'n/d').padStart(7)}` +
        `  | avance L1 ${avances.linea1 === null ? 'n/d' : dos(avances.linea1.ancho / avances.linea1.fontSize)}` +
        ` · L2 ${avances.linea2 === null ? 'n/d' : dos(avances.linea2.ancho / avances.linea2.fontSize)}` +
        ` · bajada ${avances.bajada === null ? 'n/d' : dos(avances.bajada.ancho)} px`,
    )
  }

  const salida = {
    etiqueta,
    cuando: new Date().toISOString(),
    instrumento:
      'scripts-texto/b-palancas.ts — una hoja !important por palanca sobre la MISMA pagina, con el lector de a-desglose',
    anclas: { piso: PISO_DE_LA_BANDA, ancla: ANCLA_DE_LA_BANDA, tope: TOPE_DE_LA_BANDA, anclaL1: ANCLA_L1, anclaL2: ANCLA_L2 },
    filas,
  }
  const ruta = path.join(RAIZ_DE_SALIDAS, `b-palancas-${etiqueta}.json`)
  writeFileSync(ruta, `${JSON.stringify(salida, null, 2)}\n`, 'utf8')
  console.log(`\n  -> ${ruta}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
