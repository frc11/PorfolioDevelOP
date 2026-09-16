/**
 * TEXTO-1 · D — LA SUPERPOSICIÓN QUE CADA CONFIGURACIÓN DEJARÍA, sobre el píxel.
 *
 *     npx tsx scripts-texto/d-superposicion.ts --etiqueta=simulacion
 *     npx tsx scripts-texto/d-superposicion.ts --etiqueta=simulacion --ancho=768
 *
 * ── Por qué existe, y qué pregunta contesta que C no contesta ─────────────
 *
 * `c-minima.ts` contesta **cuánto baja el bloque**. El criterio de aceptación
 * del sprint es otro: *«la superposición tiene que bajar a un dígito»*. Las dos
 * no son la misma cosa y la diferencia importa — un bloque que no entra entero
 * debajo del 0,68 puede igual dejar la tinta abajo del 10 %, porque la masa del
 * logo no es un rectángulo lleno: tiene el hueco del medio y se afina abajo.
 *
 * Así que esto **mide la cifra de aceptación ANTES de aplicar nada**: monta cada
 * configuración candidata con una hoja `!important`, saca las mismas tres
 * capturas de TAPADO-1 y cruza las dos máscaras. Es el mismo instrumento y la
 * misma cifra con la que se va a juzgar el después; lo único que cambia es que
 * la configuración entra por CSS en vez de por el árbol.
 *
 * ⚠️ **`D` SE SACA UNA SOLA VEZ POR ANCHO, y es correcto: ninguna de estas
 * reglas toca la escena.** Sacarla por configuración sería gastar capturas para
 * volver a fotografiar exactamente lo mismo — y, peor, meter la varianza del
 * render 3D adentro de una comparación que quiere ser sólo del texto.
 *
 * ⚠️ **LA BAJADA EN UNA LÍNEA SE SIMULA CON `nowrap`, y eso invalida SU PROPIA
 * cifra de ancho.** El texto se sale de la caja en vez de acortarse. Para el
 * ALTO del bloque y para la posición del titular —que es lo que se está
 * midiendo— da exactamente lo que daría una bajada más corta; para el número de
 * la bajada, no. Se publica igual y se declara acá.
 *
 * ── ⚠️ NINGUNA CAPTURA SE ESCRIBE ADENTRO DEL ÁRBOL MIENTRAS LA PÁGINA ESTÁ
 *    ABIERTA, Y SE APRENDIÓ FALLANDO EN ESTE MISMO BANCO ────────────────────
 *
 * La primera versión copiaba el cuadro A a `docs/rediseno/capturas/` adentro del
 * bucle de configuraciones. El dev server vigila el repo: a 768 esa escritura
 * disparó un recompilado y la página se recargó en caliente **sin la hoja de
 * utilidades**. El titular pasó a 32 px —el `2em` que trae el navegador para un
 * `h1` sin clase—, el bloque se fue a `y = 1075` con el viewport en 1024 y las
 * tres configuraciones siguientes publicaron `NaN`. La cifra no daba «un poco
 * distinta»: daba otra página. `tapado-comun.ts` ya declaraba el riesgo para las
 * capturas intermedias; acá se extiende a las definitivas — se juntan y se
 * copian **con la pestaña ya cerrada**.
 */

import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { capturar } from '../scripts-b4/captura'
import { medir, scrollA, type Pagina } from '../scripts-b4/navegador'
import { cruzar, leer, type Rect } from '../scripts-tapado/mascaras'
import {
  ASENTAMIENTO_MS,
  PONER_CAPA,
  SIN_LA_ESCENA,
  SOLO_LA_ESCENA,
  TEMP,
  VENTANAS,
  argumento,
  asegurarCarpetas,
  conChrome,
  cuatro,
  dos,
  enLaVentana,
  type EstadoDeCapas,
  type Ventana,
} from '../scripts-tapado/tapado-comun'
import { CARPETA_DE_CAPTURAS_DEL_TEXTO, LECTOR, RAIZ_DE_SALIDAS, type Desglose } from './texto-comun'

const PISO_DE_LA_BANDA = 375
const ANCLA_DE_LA_BANDA = 1440
const TOPE_DE_LA_BANDA = 1920
const ANCLA_L2 = 104

function deLaCurva(piso: number, ancla: number, ancho: number): number {
  const a = (ancla - piso) / (ANCLA_DE_LA_BANDA - PISO_DE_LA_BANDA)
  const b = ancla - a * ANCLA_DE_LA_BANDA
  const techo = b + a * TOPE_DE_LA_BANDA
  return Math.min(Math.max(piso, b + a * ancho), techo)
}

const SEL_L2 = '[data-pantalla="hero"] h1 > span:nth-of-type(2)'
const SEL_BAJADA = '[data-pantalla="hero"] [data-nivel="cuerpo"]'
const SEL_PANTALLA = '[data-pantalla="hero"]'
const SEL_COLUMNA = '[data-pantalla="hero"] div[class*="gap-8"]'
const SEL_BLOQUE_P2 = '[data-pantalla="hero"] div[class*="gap-6"]'

const pisoL2 = (piso: number) => (ancho: number): string =>
  `${SEL_L2}{font-size:${deLaCurva(piso, ANCLA_L2, ancho).toFixed(4)}px!important}`
const bajadaEnUnaLinea = (): string => `${SEL_BAJADA}{white-space:nowrap!important}`
const huecos = (h1: number, h2: number) => (): string =>
  `${SEL_COLUMNA}{gap:${h1}px!important}${SEL_BLOQUE_P2}{gap:${h2}px!important}`
const sinRelleno = (): string => `${SEL_PANTALLA}{padding-bottom:0!important}`
/**
 * FUERA DEL ALCANCE, MEDIDO IGUAL — la caja del titular sin el `col-span-2`.
 *
 * `GEOMETRIA.claseDelTitular` acota el titular a 2 de 3 de la medida, y esa
 * decisión es de B1: sale de tres bordes seguros medidos a 1440, 1920 y 2560,
 * o sea de ESCRITORIO. La clase, sin embargo, es `tablet:`, así que también
 * aplica a 768 — donde el logo está centrado y es más ancho que el cuadro, y
 * un borde seguro horizontal no compra nada. Esto NO se aplica: se mide para
 * que el número exista cuando alguien decida si la costura va en `tablet` o en
 * `escritorio`.
 */
const cajaEntera = (): string => `[data-pantalla="hero"] [class*="col-span-2"]{grid-column:1/-1!important}`

interface Configuracion {
  readonly clave: string
  readonly que: string
  readonly reglas: readonly ((ancho: number) => string)[]
}

/**
 * LAS CANDIDATAS. La primera es el control —tiene que reproducir
 * `a-verdad-hoy.json`— y las demás van de menos a más cambio.
 */
const CONFIGURACIONES: readonly Configuracion[] = [
  { clave: '0-base', que: 'el arbol como esta hoy — control contra a-verdad-hoy.json', reglas: [] },
  { clave: '1-huecos-8-8', que: 'los dos huecos declarados a 8px (fuera de la lista de la instruccion)', reglas: [huecos(8, 8)] },
  { clave: '2-bajada-1L', que: 'la bajada en UNA linea', reglas: [bajadaEnUnaLinea] },
  { clave: '3-bajada-1L-huecos-8-8', que: 'bajada en 1 linea + los dos huecos a 8px', reglas: [bajadaEnUnaLinea, huecos(8, 8)] },
  { clave: '4-pisoL2-62', que: 'piso de display-xl 67 -> 62 (desenvuelve la linea 2 a 768) — UNA sola palanca', reglas: [pisoL2(62)] },
  {
    clave: '5-pisoL2-62-bajada-1L-huecos-8-8',
    que: 'la MAXIMA alcanzable con pb-20 intacto: piso L2 62 + bajada 1 linea + huecos 8/8',
    reglas: [pisoL2(62), bajadaEnUnaLinea, huecos(8, 8)],
  },
  {
    clave: '6-sin-pb-20',
    que: 'la de arriba MAS pb-20 = 0 — la lectura de la instruccion; la pastilla queda encima del CTA',
    reglas: [pisoL2(62), bajadaEnUnaLinea, huecos(8, 8), sinRelleno],
  },
  { clave: '7-pisoL2-64', que: 'piso de display-xl 67 -> 64 — la palanca (b) mas chica que desenvuelve a 768', reglas: [pisoL2(64)] },
  { clave: '8-pisoL2-58', que: 'piso de display-xl 67 -> 58 — la razon entre registros baja a 1,57x', reglas: [pisoL2(58)] },
  { clave: '9-pisoL2-50', que: 'piso de display-xl 67 -> 50 — 1,35x', reglas: [pisoL2(50)] },
  { clave: '10-pisoL2-44', que: 'piso de display-xl 67 -> 44 — 1,19x, el limite de que siga habiendo dos registros', reglas: [pisoL2(44)] },
  { clave: '11-pisoL2-62-bajada-1L', que: 'piso L2 62 + bajada en 1 linea, con los huecos INTACTOS', reglas: [pisoL2(62), bajadaEnUnaLinea] },
  { clave: '12-pisoL2-62-huecos-8-8', que: 'piso L2 62 + huecos 8/8, con la bajada INTACTA', reglas: [pisoL2(62), huecos(8, 8)] },
  { clave: '13-pisoL2-50-bajada-1L', que: 'piso L2 50 + bajada en 1 linea', reglas: [pisoL2(50), bajadaEnUnaLinea] },
  {
    clave: '14-pisoL2-50-bajada-1L-huecos-8-8',
    que: 'piso L2 50 + bajada 1 linea + huecos 8/8 — el corrimiento maximo con dos registros distinguibles',
    reglas: [pisoL2(50), bajadaEnUnaLinea, huecos(8, 8)],
  },
  { clave: '15-huecos-16-16', que: 'los dos huecos a 16px — medio paso', reglas: [huecos(16, 16)] },
  { clave: '16-caja-entera', que: 'FUERA DEL ALCANCE (layout): el titular usa las 3 columnas de la medida en vez de 2', reglas: [cajaEntera] },
  {
    clave: '17-caja-entera-huecos-8-8',
    que: 'FUERA DEL ALCANCE (layout): la caja entera + los dos huecos a 8px',
    reglas: [cajaEntera, huecos(8, 8)],
  },
]

interface Caja {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

const HOJA_DE_CONFIGURACION = 'texto-configuracion'

function PONER_CONFIGURACION(regla: string): string {
  return `(async () => {
  const id = ${JSON.stringify(HOJA_DE_CONFIGURACION)}
  let hoja = document.getElementById(id)
  if (hoja === null) { hoja = document.createElement('style'); hoja.id = id; document.head.appendChild(hoja) }
  hoja.textContent = ${JSON.stringify(regla)}
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  return true
})()`
}

interface Copia {
  readonly desde: string
  readonly hasta: string
}

async function medirVentana(
  pagina: Pagina,
  v: Ventana,
  etiqueta: string,
  copias: Copia[],
): Promise<unknown> {
  await scrollA(pagina, 0)
  await medir<boolean>(pagina, `(async () => { await new Promise((r) => setTimeout(r, 900)); return true })()`)

  // D — la escena sola. UNA sola vez: ninguna regla de este banco la toca.
  const soloEscena = await medir<EstadoDeCapas>(pagina, PONER_CAPA(SOLO_LA_ESCENA))
  if (soloEscena.escena !== 'visible' || soloEscena.titular !== 'hidden') {
    throw new Error(`a ${v.ancho}: la capa D no tomo — escena «${soloEscena.escena}», titular «${soloEscena.titular}»`)
  }
  const dRuta = path.join(TEMP, `texto-${etiqueta}-${v.ancho}-d.png`)
  await capturar(pagina, dRuta)
  await medir<EstadoDeCapas>(pagina, PONER_CAPA(''))
  const D = leer(dRuta)

  const filas: unknown[] = []
  /**
   * EL CENTINELA DE LA RECARGA EN CALIENTE. Ninguna regla de este banco toca la
   * línea 1, así que su tamaño tiene que ser el MISMO en las siete
   * configuraciones. Si cambia, la hoja de utilidades se fue —es el modo de
   * falla que este banco sufrió y que el docblock documenta— y lo que sigue no
   * es una medición: es otra página. Tira en vez de publicar.
   */
  let fsL1DelControl: number | null = null
  for (const c of CONFIGURACIONES) {
    const regla = c.reglas.map((r) => r(v.ancho)).join('')
    await medir<boolean>(pagina, PONER_CONFIGURACION(regla))
    const rect = await medir<Desglose | null>(pagina, LECTOR)
    if (rect === null) throw new Error(`a ${v.ancho}: el lector no encontro el hero en «${c.clave}»`)
    if (fsL1DelControl === null) fsL1DelControl = rect.linea1.fontSize
    else if (Math.abs(rect.linea1.fontSize - fsL1DelControl) > 0.01) {
      throw new Error(
        `a ${v.ancho}, en «${c.clave}»: la linea 1 mide ${rect.linea1.fontSize} px y en el control media ` +
          `${fsL1DelControl}. Ninguna regla la toca: la hoja de utilidades se cayo (recarga en caliente del dev server).`,
      )
    }

    // A — la vista, para el humano.
    const aRuta = path.join(TEMP, `texto-${etiqueta}-${v.ancho}-${c.clave}-a.png`)
    await capturar(pagina, aRuta)
    copias.push({ desde: aRuta, hasta: path.join(CARPETA_DE_CAPTURAS_DEL_TEXTO, `${etiqueta}-${c.clave}-${v.ancho}x${v.alto}.png`) })

    // C — el texto sin la escena, CON la configuracion puesta.
    const sinEscena = await medir<EstadoDeCapas>(pagina, PONER_CAPA(SIN_LA_ESCENA))
    if (sinEscena.escena !== 'hidden' || sinEscena.titular !== 'visible') {
      throw new Error(`a ${v.ancho}: la capa C no tomo en «${c.clave}»`)
    }
    const cRuta = path.join(TEMP, `texto-${etiqueta}-${v.ancho}-${c.clave}-c.png`)
    await capturar(pagina, cRuta)
    await medir<EstadoDeCapas>(pagina, PONER_CAPA(''))
    const C = leer(cRuta)

    const medirCaja = (caja: Caja | null): Record<string, unknown> | null => {
      if (caja === null || caja.ancho <= 0 || caja.alto <= 0) return null
      const r: Rect = { x: caja.x, y: caja.y, ancho: caja.ancho, alto: caja.alto }
      const x = cruzar(C, D, r)
      return {
        caja: { x: dos(caja.x), y: dos(caja.y), ancho: dos(caja.ancho), alto: dos(caja.alto) },
        glifos: x.glifos,
        tintaSobreLogo: cuatro(x.fraccionDeTinta),
        cajaSobreLogo: cuatro(x.fraccionDeCaja),
        tintaBajoAA: cuatro(x.fraccionBajoAA),
      }
    }

    const titular = medirCaja(rect.titular)
    filas.push({
      clave: c.clave,
      que: c.que,
      regla,
      fsL1: dos(rect.linea1.fontSize),
      fsL2: dos(rect.linea2.fontSize),
      renglonesL1: rect.linea1.renglones?.cantidad ?? 0,
      renglonesL2: rect.linea2.renglones?.cantidad ?? 0,
      renglonesBajada: rect.bajada.renglones?.cantidad ?? 0,
      altoDelBloque: dos(rect.bloque?.alto ?? 0),
      topeDelBloque: dos(rect.bloque?.y ?? 0),
      topeDelTitular: dos(rect.titular?.y ?? 0),
      titular,
      linea1: medirCaja(rect.linea1.caja),
      linea2: medirCaja(rect.linea2.caja),
      bloque: medirCaja(rect.bloque),
    })
    const t = titular as { tintaSobreLogo: number } | null
    console.log(
      `    ${c.clave.padEnd(34)} titular ${((t?.tintaSobreLogo ?? Number.NaN) * 100).toFixed(1).padStart(5)} %` +
        ` · bloque ${dos(rect.bloque?.alto ?? 0).toFixed(1).padStart(6)} px` +
        ` · tope del titular ${dos(rect.titular?.y ?? 0).toFixed(0).padStart(4)}` +
        ` · L1 ${rect.linea1.renglones?.cantidad ?? 0}x${dos(rect.linea1.fontSize).toFixed(1)}` +
        ` · L2 ${rect.linea2.renglones?.cantidad ?? 0}x${dos(rect.linea2.fontSize).toFixed(1)}`,
    )
  }
  await medir<boolean>(pagina, PONER_CONFIGURACION(''))
  return filas
}

async function main(): Promise<void> {
  asegurarCarpetas()
  mkdirSync(CARPETA_DE_CAPTURAS_DEL_TEXTO, { recursive: true })
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const etiqueta = argumento('etiqueta', 'simulacion')
  const soloAncho = argumento('ancho', '')
  const ventanas = soloAncho === '' ? VENTANAS : VENTANAS.filter((v) => String(v.ancho) === soloAncho)
  if (ventanas.length === 0) throw new Error(`ningun ancho coincide con --ancho=${soloAncho}`)

  const filas: unknown[] = []
  const copias: Copia[] = []
  for (const v of ventanas) {
    console.log(`\n  ${v.ancho}x${v.alto}`)
    const resultados = await conChrome(`texto-d-${v.ancho}`, async (chrome) =>
      enLaVentana(chrome, v, async ({ pagina }) => medirVentana(pagina, v, etiqueta, copias), {
        asentamientoMs: ASENTAMIENTO_MS,
      }),
    )
    filas.push({ ancho: v.ancho, alto: v.alto, configuraciones: resultados })
  }
  // Recién acá, con TODAS las pestañas cerradas: escribir adentro del árbol con
  // una página abierta dispara el recompilado del dev server. Ver el docblock.
  for (const c of copias) copyFileSync(c.desde, c.hasta)

  const salida = {
    etiqueta,
    cuando: new Date().toISOString(),
    instrumento:
      'scripts-texto/d-superposicion.ts — el cruce de TAPADO-1 (C texto sin escena x D escena sola) con una hoja !important por configuracion',
    advertencia:
      'la bajada en una linea se simula con white-space:nowrap: el texto se SALE de la caja en vez de acortarse, asi que su propio ancho no vale; el alto del bloque y la posicion del titular si',
    filas,
  }
  const ruta = path.join(RAIZ_DE_SALIDAS, `d-superposicion-${etiqueta}.json`)
  writeFileSync(ruta, `${JSON.stringify(salida, null, 2)}\n`, 'utf8')
  console.log(`\n  -> ${ruta}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
