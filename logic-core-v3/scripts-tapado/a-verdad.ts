/**
 * TAPADO-1 · A — LA VERDAD DE PANTALLA DEL HERO EN REPOSO, en los ocho anchos.
 *
 *     npx tsx scripts-tapado/a-verdad.ts --etiqueta=hoy
 *     npx tsx scripts-tapado/a-verdad.ts --etiqueta=centrado --composicion=centrado
 *     npx tsx scripts-tapado/a-verdad.ts --etiqueta=hoy --ancho=390
 *
 * ── Qué contesta, y por qué esta es la pregunta ───────────────────────────
 *
 * `s10-vertical.invariant.ts` §5 publica **0 %** de superposición para el hero a
 * 390. El humano capturó el sitio a 425, 768 y 1024 y el logo tapa el titular
 * entero. Uno de los dos describe la pantalla. Este script lo dirime midiendo
 * lo que se ve: abre la página en cada ancho con recarga limpia, lee los
 * rectángulos reales del bloque de texto del hero y cruza dos capturas
 * SEPARADAS —el texto sin escena y la escena sin texto— para que las dos tintas
 * negras no se confundan. El porqué de esa separación está en `mascaras.ts`.
 *
 * ── LAS TRES CIFRAS QUE PUBLICA, y qué distingue cada una ─────────────────
 *
 *   · **tinta sobre logo** — de los píxeles DIBUJADOS del titular, qué fracción
 *     cae sobre la masa negra. Es la que corresponde a «¿se lee?».
 *   · **caja sobre logo** — lo mismo con el rectángulo de layout entero. Es la
 *     cota de arriba, y la diferencia entre las dos dice cuánto del rectángulo
 *     es aire.
 *   · **la banda libre** — en qué filas de la pantalla NO hay masa negra dentro
 *     de la columna del texto. Es el hueco al que habría que mudar el bloque, y
 *     existe o no existe independientemente de dónde esté el bloque hoy.
 *
 * ⚠️ **No juzga.** No dice si se ve bien: publica el número y la captura.
 */

import { copyFileSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

import { capturar } from '../scripts-b4/captura'
import { medir, scrollA, type Pagina } from '../scripts-b4/navegador'
import { bandasDeMasa, cruzar, histograma, leer, UMBRAL_DE_MASA, type Rect } from './mascaras'
import {
  ASENTAMIENTO_MS,
  COMPOSICION_CENTRADA,
  HOJA_DE_CAPAS,
  PONER_CAPA,
  SIN_LA_ESCENA,
  SOLO_LA_ESCENA,
  type EstadoDeCapas,
  CARPETA_DE_CAPTURAS,
  RAIZ_DE_SALIDAS,
  TEMP,
  VENTANAS,
  argumento,
  asegurarCarpetas,
  conChrome,
  cuatro,
  dos,
  enLaVentana,
  type Ventana,
} from './tapado-comun'

/**
 * LOS NODOS DEL HERO, cada uno por un selector que sale del marcado y no de una
 * clase de estilo. `[data-pantalla="hero"]` es la caja de la pantalla entera;
 * el `h1` es el titular; los dos `span` son sus dos registros.
 */
const LECTOR_DE_RECTANGULOS = `(() => {
  const pantalla = document.querySelector('[data-pantalla="hero"]')
  if (pantalla === null) return null
  const h1 = pantalla.querySelector('h1')
  const piezas = h1 === null ? [] : [...h1.children]
  const cuerpos = [...pantalla.querySelectorAll('[data-nivel="cuerpo"], p')]
  const cta = pantalla.querySelector('a')
  const caja = (el) => {
    if (el === null || el === undefined) return null
    const r = el.getBoundingClientRect()
    return { x: r.x, y: r.y, ancho: r.width, alto: r.height }
  }
  const todos = [h1, ...cuerpos, cta].filter((e) => e !== null && e !== undefined)
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
  for (const el of todos) {
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue
    x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y)
    x1 = Math.max(x1, r.x + r.width); y1 = Math.max(y1, r.y + r.height)
  }
  return {
    pantalla: caja(pantalla),
    titular: caja(h1),
    linea1: caja(piezas[0]),
    linea2: caja(piezas[1]),
    bajada: caja(cuerpos[0]),
    cta: caja(cta),
    bloque: Number.isFinite(x0) ? { x: x0, y: y0, ancho: x1 - x0, alto: y1 - y0 } : null,
    ventana: { ancho: window.innerWidth, alto: window.innerHeight },
    clasesDeLaPantalla: pantalla.getAttribute('class'),
  }
})()`

interface Caja {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

interface Rectangulos {
  readonly pantalla: Caja | null
  readonly titular: Caja | null
  readonly linea1: Caja | null
  readonly linea2: Caja | null
  readonly bajada: Caja | null
  readonly cta: Caja | null
  readonly bloque: Caja | null
  readonly ventana: { readonly ancho: number; readonly alto: number }
  readonly clasesDeLaPantalla: string | null
}

export interface FilaDeVerdad {
  readonly ancho: number
  readonly alto: number
  readonly [clave: string]: unknown
}

async function medirVentana(
  pagina: Pagina,
  v: Ventana,
  etiqueta: string,
  composicion: string,
): Promise<FilaDeVerdad> {
  /**
   * `--composicion=centrado` reproduce el estado ANTERIOR del hero con una regla
   * en vez de revertir el archivo: mismo arbol, mismo bundle, mismo chunk de la
   * escena, UNA sola variable cambiada. Es la condicion para poder atribuir una
   * diferencia a la composicion y no al build.
   */
  if (composicion === 'centrado') {
    const puesta = await medir<boolean>(
      pagina,
      `(async () => {
        const hoja = document.createElement('style')
        hoja.id = ${JSON.stringify(`${HOJA_DE_CAPAS}-composicion`)}
        hoja.textContent = ${JSON.stringify(COMPOSICION_CENTRADA)}
        document.head.appendChild(hoja)
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
        const el = document.querySelector('[data-pantalla="hero"]')
        return el !== null && getComputedStyle(el).justifyContent === 'center'
      })()`,
    )
    if (!puesta) throw new Error(`a ${v.ancho}: la composicion «centrado» no tomo`)
  }
  await scrollA(pagina, 0)
  await medir<boolean>(pagina, `(async () => { await new Promise((r) => setTimeout(r, 900)); return true })()`)

  const rect = await medir<Rectangulos | null>(pagina, LECTOR_DE_RECTANGULOS)
  if (rect === null) throw new Error(`a ${v.ancho}: no hay [data-pantalla="hero"] en el DOM`)

  // A — la página como se ve. Es la del reporte; no se mide.
  const aRuta = path.join(TEMP, `${etiqueta}-${v.ancho}-a.png`)
  await capturar(pagina, aRuta)

  // C — el texto sobre fondo plano: la escena escondida por hoja de estilos.
  const sinEscena = await medir<EstadoDeCapas>(pagina, PONER_CAPA(SIN_LA_ESCENA))
  if (sinEscena.escena !== 'hidden' || sinEscena.titular !== 'visible') {
    throw new Error(`a ${v.ancho}: la capa C no tomo — escena «${sinEscena.escena}», titular «${sinEscena.titular}»`)
  }
  const cRuta = path.join(TEMP, `${etiqueta}-${v.ancho}-c.png`)
  await capturar(pagina, cRuta)

  // D — la escena sola: todo lo demas escondido por la misma hoja.
  const soloEscena = await medir<EstadoDeCapas>(pagina, PONER_CAPA(SOLO_LA_ESCENA))
  if (soloEscena.escena !== 'visible' || soloEscena.titular !== 'hidden') {
    throw new Error(`a ${v.ancho}: la capa D no tomo — escena «${soloEscena.escena}», titular «${soloEscena.titular}»`)
  }
  const dRuta = path.join(TEMP, `${etiqueta}-${v.ancho}-d.png`)
  await capturar(pagina, dRuta)
  await medir<EstadoDeCapas>(pagina, PONER_CAPA(''))

  const C = leer(cRuta)
  const D = leer(dRuta)

  const medirCaja = (c: Caja | null): Record<string, unknown> | null => {
    if (c === null || c.ancho <= 0 || c.alto <= 0) return null
    const r: Rect = { x: c.x, y: c.y, ancho: c.ancho, alto: c.alto }
    const x = cruzar(C, D, r)
    return {
      caja: { x: dos(c.x), y: dos(c.y), ancho: dos(c.ancho), alto: dos(c.alto) },
      glifos: x.glifos,
      sobreElLogo: x.sobreElLogo,
      tintaSobreLogo: cuatro(x.fraccionDeTinta),
      areaDeLaCaja: x.areaDeLaCaja,
      cajaSobreLogo: cuatro(x.fraccionDeCaja),
      luzMedianaBajoElGlifo: dos(x.luzMedianaBajoElGlifo),
      contrasteMediano: dos(x.contrasteMediano),
      tintaBajoAA: cuatro(x.fraccionBajoAA),
      fondoDeC: x.fondoDeC,
    }
  }

  const columna = rect.bloque
  const bandas =
    columna === null
      ? []
      : bandasDeMasa(D, columna.x, columna.x + columna.ancho).map((b) => ({
          desde: b.desde,
          hasta: b.hasta,
          alto: b.hasta - b.desde + 1,
        }))
  const huecos: { desde: number; hasta: number; alto: number }[] = []
  let cursor = 0
  for (const b of bandas) {
    if (b.desde > cursor) huecos.push({ desde: cursor, hasta: b.desde - 1, alto: b.desde - cursor })
    cursor = b.hasta + 1
  }
  if (cursor < D.alto) huecos.push({ desde: cursor, hasta: D.alto - 1, alto: D.alto - cursor })

  const destino = path.join(CARPETA_DE_CAPTURAS, `${etiqueta}-${v.ancho}x${v.alto}.png`)
  copyFileSync(aRuta, destino)

  return {
    ancho: v.ancho,
    alto: v.alto,
    procedencia: v.procedencia,
    ventanaReportada: rect.ventana,
    clasesDeLaPantalla: rect.clasesDeLaPantalla,
    captura: destino,
    titular: medirCaja(rect.titular),
    linea1: medirCaja(rect.linea1),
    linea2: medirCaja(rect.linea2),
    bajada: medirCaja(rect.bajada),
    cta: medirCaja(rect.cta),
    bloque: medirCaja(rect.bloque),
    bandasDeMasaEnLaColumna: bandas,
    huecosEnLaColumna: huecos,
    mayorHueco: huecos.reduce<{ desde: number; hasta: number; alto: number } | null>(
      (a, b) => (a === null || b.alto > a.alto ? b : a),
      null,
    ),
    histogramaDeLaEscenaSola: histograma(D),
  }
}

async function main(): Promise<void> {
  asegurarCarpetas()
  mkdirSync(CARPETA_DE_CAPTURAS, { recursive: true })
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const etiqueta = argumento('etiqueta', 'sin-etiqueta')
  const soloAncho = argumento('ancho', '')
  const composicion = argumento('composicion', 'hoy')
  if (composicion !== 'hoy' && composicion !== 'centrado') {
    throw new Error(`--composicion admite «hoy» o «centrado», llego «${composicion}»`)
  }
  const ventanas = soloAncho === '' ? VENTANAS : VENTANAS.filter((v) => String(v.ancho) === soloAncho)
  if (ventanas.length === 0) throw new Error(`ningun ancho coincide con --ancho=${soloAncho}`)

  /**
   * ⚠️ **UN CHROME POR ANCHO, Y NO ES PRUDENCIA: ES UN DEFECTO MEDIDO.** Con un
   * solo navegador y una pestaña nueva por ancho, **la tercera pestaña no monta
   * la escena del home**: `[data-escena]` sigue en `null` después de ocho
   * segundos de espera. El patrón sigue al ÍNDICE de la pestaña y no al ancho
   * —falló a 425 con el orden de ocho y a 390 con el mismo orden corrido—, o sea
   * que es estado de GPU que sobrevive al `Target.closeTarget`, no una propiedad
   * de ningún viewport. Un proceso por ancho lo hace desaparecer y es además lo
   * más literal que se puede ser con la regla del sprint: recarga limpia.
   *
   * ⚠️ Y el detector que lo encontró se queda: `hayCanvas` NO alcanza como
   * comprobación de que la escena montó —el preloader trae su propio `<canvas>`—
   * y por eso la verificación que vale es la del nodo `[data-escena]`.
   */
  const acumulado: FilaDeVerdad[] = []
  for (const v of ventanas) {
    const fila = await conChrome(`tapado-${v.ancho}`, async (chrome) =>
      enLaVentana(chrome, v, async ({ pagina }) => medirVentana(pagina, v, etiqueta, composicion), {
        asentamientoMs: ASENTAMIENTO_MS,
      }),
    )
    const t = fila.titular as { tintaSobreLogo: number; cajaSobreLogo: number; glifos: number; tintaBajoAA: number } | null
    const b = fila.bloque as { tintaSobreLogo: number } | null
    const pct = (x: number): string => `${(x * 100).toFixed(1).padStart(5)} %`
    console.log(
      `  ${String(v.ancho).padStart(4)}x${String(v.alto).padEnd(4)}  titular: tinta ${t === null ? '  n/d' : pct(t.tintaSobreLogo)}` +
        ` · caja ${t === null ? '  n/d' : pct(t.cajaSobreLogo)}` +
        ` · ${String(t === null ? 0 : t.glifos).padStart(5)} px de tinta` +
        ` · bajo AA ${t === null ? '  n/d' : pct(t.tintaBajoAA)}` +
        `   |   bloque: tinta ${b === null ? '  n/d' : pct(b.tintaSobreLogo)}`,
    )
    acumulado.push(fila)
  }
  const filas = acumulado

  const salida = {
    etiqueta,
    composicion,
    cuando: new Date().toISOString(),
    instrumento: 'scripts-tapado/a-verdad.ts — Page.captureScreenshot x3 (A vista, C texto sin escena, D escena sola) + getBoundingClientRect',
    umbrales: { masa: dos(UMBRAL_DE_MASA), glifo: 'derivado por caja: (moda del fondo de C + tinta) / 2' },
    filas,
  }
  writeFileSync(path.join(RAIZ_DE_SALIDAS, `a-verdad-${etiqueta}.json`), `${JSON.stringify(salida, null, 2)}\n`, 'utf8')
  console.log(`\n  -> ${path.join(RAIZ_DE_SALIDAS, `a-verdad-${etiqueta}.json`)}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
