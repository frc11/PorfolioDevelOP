/**
 * TEXTO-2 · E — LA SUPERPOSICIÓN DEL ÁRBOL, ANTES Y DESPUÉS, en los ocho anchos.
 *
 *     npx tsx scripts-texto/e-antes-despues.ts --etiqueta=antes --sims=1
 *     npx tsx scripts-texto/e-antes-despues.ts --etiqueta=despues
 *
 * ── Qué es, y en qué se diferencia de `d-superposicion.ts` ────────────────
 *
 * `d-superposicion.ts` mide CONFIGURACIONES SIMULADAS: dieciocho hojas
 * `!important` sobre la misma página, para decidir qué aplicar. Esto mide **el
 * árbol**, sin una sola regla puesta encima, y por eso se corre dos veces —una
 * antes de tocar `src/` y otra después—. Es la cifra de aceptación del sprint y
 * la única que puede decir que un cambio APLICADO hizo lo que el simulado
 * prometía.
 *
 * La técnica es la misma de TAPADO-1 y no cambia un píxel: tres cuadros del
 * mismo layout —A la vista, C el texto sin la escena, D la escena sola— y la
 * cifra es la intersección de la tinta del titular con la masa negra del logo.
 *
 * ── `--sims=1`: las dos simulaciones que este sprint tenía que VERIFICAR ──
 *
 * La instrucción pide comprobar la medición de `TEXTO-1` §7 D1 —la caja del
 * titular a 768 acotada por una clase derivada en escritorio— antes de tocarla.
 * Con `--sims=1` la corrida agrega, en la MISMA página y sin capturas propias,
 * las dos hojas que reproducen lo que el cambio va a hacer:
 *
 *   · `sim-caja-entera`  el titular usa las 3 columnas de la medida ABAJO de
 *                        1025, que es exactamente el alcance del cambio.
 *   · `sim-caja-y-huecos` eso más los dos huecos a 8 px, también sólo abajo de
 *                        1025.
 *
 * Las dos se aplican **sólo cuando el ancho de la pestaña está abajo de 1025**,
 * que es lo que hace la variante `escritorio:` en el árbol. A 1440 y a 1920 las
 * tres filas tienen que dar el MISMO número, y ése es el control de que el
 * alcance es el que se dice.
 *
 * ── ⚠️ Las capturas se copian con la pestaña CERRADA ──────────────────────
 *
 * El dev server vigila el repo: una captura escrita adentro del árbol con la
 * página abierta dispara un recompilado y la página se recarga en caliente sin
 * la hoja de utilidades. Lo sufrió `d-superposicion.ts` y está escrito allá; acá
 * se junta la lista y se copia al final, con todas las pestañas cerradas.
 *
 * ── ⚠️ Y el hueco REAL no es el que sobra hasta el borde ──────────────────
 *
 * La escena tiene una SEGUNDA masa negra que empieza en ~0,781 del alto
 * (`TEXTO-1` §4). El hueco libre es el que va entre las dos masas —57 a 100 px—
 * y no los 181 a 324 que sobran debajo de la primera. Se lee de
 * `a-verdad-hoy.json`, que es donde está medido, y no se vuelve a medir: es la
 * escena, y la escena no se toca.
 */

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
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

/** El breakpoint `escritorio`, que es el alcance del cambio. Escrito acá una
 *  vez: las simulaciones tienen que respetarlo o no simulan el cambio. */
const ESCRITORIO_PX = 1025

/**
 * ⚠️ **LA SEGUNDA MÁSCARA DE FONDO, Y POR QUÉ LA PRIMERA DEJÓ DE ALCANZAR.**
 *
 * `SOLO_LA_ESCENA` esconde TODO menos `[data-escena]`, así que la captura D es
 * «dónde está la masa del logo» — y eso era exactamente lo que había detrás del
 * texto mientras el panel del Hero fuera transparente en todos los anchos.
 *
 * **TEXTO-3 rompe esa equivalencia**: abajo de 375 el Hero pinta `papel-opaco`,
 * o sea que el panel TAPA la escena. Y `visibility: hidden` esconde el fondo del
 * elemento junto con su contenido, así que D sigue fotografiando el logo entero
 * **como si el panel no existiera**. Medir contra D a 320 contestaría «cuánta
 * tinta caería sobre el logo SI el panel fuera transparente», que es una
 * pregunta legítima —es la composición que sigue rota debajo— pero **no es la
 * pantalla**.
 *
 * Así que se saca una máscara más: la página **sin el texto del Hero y con todo
 * lo demás en su lugar**, que es literalmente «qué hay detrás de los glifos».
 * Sobre papel opaco no hay masa y el contraste es el de la tinta contra el
 * papel; sobre panel transparente reproduce la escena.
 *
 * Las dos se publican, y la diferencia entre ellas ES la medida de cuánto tapa
 * el panel. Ninguna reemplaza a la otra: `sobreLaEscena` dice si la composición
 * está sana, `detrasDelTexto` dice si la pantalla se lee.
 */
const SIN_EL_TEXTO_DEL_HERO =
  '[data-pantalla="hero"] h1,[data-pantalla="hero"] h1 *,' +
  // ⚠ COMPO-1: la bajada subió un escalón y pasó de `data-nivel="cuerpo"` a
  // `data-nivel="base"`. Un selector atado al nivel viejo dejaría el párrafo
  // VISIBLE en la máscara E, o sea que «lo que hay detrás del texto» incluiría
  // su propia tinta — el instrumento se volvería ciego justo donde cambió la
  // pantalla. Van los dos, que es lo que lo hace independiente del escalón.
  '[data-pantalla="hero"] [data-nivel="cuerpo"],[data-pantalla="hero"] [data-nivel="cuerpo"] *,' +
  '[data-pantalla="hero"] [data-nivel="base"],[data-pantalla="hero"] [data-nivel="base"] *,' +
  '[data-pantalla="hero"] a,[data-pantalla="hero"] a *{visibility:hidden!important}'

const SEL_COLUMNA = '[data-pantalla="hero"] div[class*="gap-8"]'
const SEL_BLOQUE_P2 = '[data-pantalla="hero"] div[class*="gap-6"]'
const SEL_TITULAR = '[data-pantalla="hero"] [class*="col-span-2"]'

const cajaEntera = `${SEL_TITULAR}{grid-column:1/-1!important}`
const huecos8 = `${SEL_COLUMNA}{gap:8px!important}${SEL_BLOQUE_P2}{gap:8px!important}`

interface Configuracion {
  readonly clave: string
  readonly que: string
  /** La hoja, resuelta contra el ancho de la pestaña: abajo de 1025 o nada. */
  readonly regla: (ancho: number) => string
  /** Sólo el control saca capturas: son 8 por corrida y el tope son 50. */
  readonly captura: boolean
}

/**
 * ⚠ **`--capturas=no` — COMPO-1.** Este banco guarda sus capturas en
 * `capturas/texto/`, que es la carpeta que identifica los estados del árbol de
 * TEXTO-1/2/3. Un sprint posterior que lo reuse sólo por la CIFRA —la
 * superposición con las dos máscaras— dejaría ahí ocho archivos de otro estado y
 * «la captura a 375» dejaría de identificar uno. Con esta bandera se mide y no
 * se fotografía; las capturas del sprint nuevo las saca su propio banco, en su
 * propia carpeta.
 */
const SIN_CAPTURAS = argumento('capturas', '') === 'no'

const CONTROL: Configuracion = {
  clave: '0-arbol',
  que: 'el arbol como esta, sin una sola regla encima',
  regla: () => '',
  captura: true,
}

const SIMULACIONES: readonly Configuracion[] = [
  {
    clave: 'sim-caja-entera',
    que: 'PASO 1 simulado: el titular usa las 3 columnas de la medida, solo abajo de 1025',
    regla: (ancho) => (ancho < ESCRITORIO_PX ? cajaEntera : ''),
    captura: false,
  },
  {
    clave: 'sim-caja-y-huecos',
    que: 'PASO 1 + PASO 3 simulados: la caja entera y los dos huecos a 8 px, solo abajo de 1025',
    regla: (ancho) => (ancho < ESCRITORIO_PX ? `${cajaEntera}${huecos8}` : ''),
    captura: false,
  },
]

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

interface Caja {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

interface Banda {
  readonly desde: number
  readonly hasta: number
  readonly alto: number
}

export interface HuecoEntreMasas {
  readonly ancho: number
  readonly alto: number
  readonly masa1Hasta: number | null
  readonly masa2Desde: number | null
  /** Los píxeles libres ENTRE las dos masas. `null` si no hay segunda masa. */
  readonly huecoLibre: number | null
  /** Lo que sobra desde el fin de la masa 1 hasta el borde de abajo. */
  readonly huecoHastaElBorde: number | null
}

/**
 * EL HUECO DE VERDAD, leído de `a-verdad-hoy.json` y no medido de nuevo.
 *
 * La masa 1 es la banda más alta dentro de la columna del texto; la masa 2 es la
 * primera banda de **15 px o más** que empieza después. El piso de 15 es el de
 * `TEXTO-1` §4 y separa una masa de una mota: las bandas de 1 a 5 px son
 * partículas sueltas y `s10-logo` ya declara que un punto de 3 px no vuelve
 * ilegible un renglón.
 */
export function huecoEntreMasas(etiqueta = 'hoy'): readonly HuecoEntreMasas[] {
  const ruta = path.join('docs/rediseno/outputs/tapado', `a-verdad-${etiqueta}.json`)
  const crudo = JSON.parse(readFileSync(ruta, 'utf8')) as {
    filas: readonly { ancho: number; alto: number; bandasDeMasaEnLaColumna: readonly Banda[] }[]
  }
  const PISO_DE_MASA = 15
  return crudo.filas.map((f) => {
    const mayor = f.bandasDeMasaEnLaColumna.reduce<Banda | null>(
      (a, b) => (a === null || b.alto > a.alto ? b : a),
      null,
    )
    if (mayor === null) {
      return { ancho: f.ancho, alto: f.alto, masa1Hasta: null, masa2Desde: null, huecoLibre: null, huecoHastaElBorde: null }
    }
    const segunda = f.bandasDeMasaEnLaColumna.find((b) => b.desde > mayor.hasta && b.alto >= PISO_DE_MASA) ?? null
    return {
      ancho: f.ancho,
      alto: f.alto,
      masa1Hasta: mayor.hasta,
      masa2Desde: segunda === null ? null : segunda.desde,
      huecoLibre: segunda === null ? null : segunda.desde - mayor.hasta - 1,
      huecoHastaElBorde: f.alto - (mayor.hasta + 1),
    }
  })
}

interface Copia {
  readonly desde: string
  readonly hasta: string
}

async function medirVentana(
  pagina: Pagina,
  v: Ventana,
  etiqueta: string,
  configuraciones: readonly Configuracion[],
  copias: Copia[],
): Promise<unknown[]> {
  await scrollA(pagina, 0)
  await medir<boolean>(pagina, `(async () => { await new Promise((r) => setTimeout(r, 900)); return true })()`)

  // D — la escena sola. UNA sola vez: ninguna regla de este banco la toca.
  const soloEscena = await medir<EstadoDeCapas>(pagina, PONER_CAPA(SOLO_LA_ESCENA))
  if (soloEscena.escena !== 'visible' || soloEscena.titular !== 'hidden') {
    throw new Error(`a ${v.ancho}: la capa D no tomo — escena «${soloEscena.escena}», titular «${soloEscena.titular}»`)
  }
  const dRuta = path.join(TEMP, `texto2-${etiqueta}-${v.ancho}-d.png`)
  await capturar(pagina, dRuta)
  await medir<EstadoDeCapas>(pagina, PONER_CAPA(''))
  const D = leer(dRuta)

  // E — LO QUE HAY DETRÁS DEL TEXTO, con el panel en su lugar. También una sola
  // vez: ninguna regla de este banco toca ni la escena ni la superficie.
  const sinTexto = await medir<EstadoDeCapas>(pagina, PONER_CAPA(SIN_EL_TEXTO_DEL_HERO))
  if (sinTexto.escena !== 'visible' || sinTexto.titular !== 'hidden') {
    throw new Error(`a ${v.ancho}: la capa E no tomo — escena «${sinTexto.escena}», titular «${sinTexto.titular}»`)
  }
  const eRuta = path.join(TEMP, `texto2-${etiqueta}-${v.ancho}-e.png`)
  await capturar(pagina, eRuta)
  await medir<EstadoDeCapas>(pagina, PONER_CAPA(''))
  const E = leer(eRuta)

  const filas: unknown[] = []
  /** El centinela de la recarga en caliente, el mismo de `d-superposicion.ts`:
   *  ninguna regla de este banco toca la línea 1, así que su cuerpo tiene que
   *  ser idéntico en las tres filas. Si cambia, la hoja de utilidades se cayó y
   *  lo que sigue no es una medición: es otra página. */
  let fsL1DelControl: number | null = null
  for (const c of configuraciones) {
    const regla = c.regla(v.ancho)
    await medir<boolean>(pagina, PONER_CONFIGURACION(regla))
    const rect = await medir<Desglose | null>(pagina, LECTOR)
    if (rect === null) throw new Error(`a ${v.ancho}: el lector no encontro el hero en «${c.clave}»`)
    if (fsL1DelControl === null) fsL1DelControl = rect.linea1.fontSize
    else if (Math.abs(rect.linea1.fontSize - fsL1DelControl) > 0.01) {
      throw new Error(
        `a ${v.ancho}, en «${c.clave}»: la linea 1 mide ${rect.linea1.fontSize} px y en el control media ` +
          `${fsL1DelControl}. Ninguna regla la toca: la hoja de utilidades se cayo.`,
      )
    }

    if (c.captura && !SIN_CAPTURAS) {
      const aRuta = path.join(TEMP, `texto2-${etiqueta}-${v.ancho}-a.png`)
      await capturar(pagina, aRuta)
      copias.push({
        desde: aRuta,
        hasta: path.join(CARPETA_DE_CAPTURAS_DEL_TEXTO, `${etiqueta}-${v.ancho}x${v.alto}.png`),
      })
    }

    const sinEscena = await medir<EstadoDeCapas>(pagina, PONER_CAPA(SIN_LA_ESCENA))
    if (sinEscena.escena !== 'hidden' || sinEscena.titular !== 'visible') {
      throw new Error(`a ${v.ancho}: la capa C no tomo en «${c.clave}»`)
    }
    const cRuta = path.join(TEMP, `texto2-${etiqueta}-${v.ancho}-${c.clave}-c.png`)
    await capturar(pagina, cRuta)
    await medir<EstadoDeCapas>(pagina, PONER_CAPA(''))
    const C = leer(cRuta)

    const medirCaja = (caja: Caja | null): Record<string, unknown> | null => {
      if (caja === null || caja.ancho <= 0 || caja.alto <= 0) return null
      const r: Rect = { x: caja.x, y: caja.y, ancho: caja.ancho, alto: caja.alto }
      const x = cruzar(C, D, r)
      // El MISMO cruce contra la otra máscara de fondo. El porqué —y por qué las
      // dos hacen falta— está en `SIN_EL_TEXTO_DEL_HERO`.
      const d = cruzar(C, E, r)
      return {
        caja: { x: dos(caja.x), y: dos(caja.y), ancho: dos(caja.ancho), alto: dos(caja.alto) },
        glifos: x.glifos,
        tintaSobreLogo: cuatro(x.fraccionDeTinta),
        cajaSobreLogo: cuatro(x.fraccionDeCaja),
        tintaBajoAA: cuatro(x.fraccionBajoAA),
        /** Contra lo que REALMENTE hay detrás: con el panel opaco puesto. */
        detrasDelTexto: {
          tintaSobreMasa: cuatro(d.fraccionDeTinta),
          tintaBajoAA: cuatro(d.fraccionBajoAA),
          luzMedianaBajoElGlifo: dos(d.luzMedianaBajoElGlifo),
          contrasteMediano: dos(d.contrasteMediano),
        },
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
      anchoDeLaCajaDelTitular: dos(rect.titular?.ancho ?? 0),
      anchoDeLaCajaDeLaBajada: dos(rect.bajada.caja?.ancho ?? 0),
      anchoMaximoDeLaBajada: dos(rect.bajada.renglones?.anchoMaximo ?? 0),
      huecos: { titularABajada: dos(rect.huecos.titularABajada), bajadaACta: dos(rect.huecos.bajadaACta) },
      altoDelBloque: dos(rect.bloque?.alto ?? 0),
      topeDelBloque: dos(rect.bloque?.y ?? 0),
      fondoDelBloque: dos((rect.bloque?.y ?? 0) + (rect.bloque?.alto ?? 0)),
      topeDelTitular: dos(rect.titular?.y ?? 0),
      titular,
      linea1: medirCaja(rect.linea1.caja),
      linea2: medirCaja(rect.linea2.caja),
      bloque: medirCaja(rect.bloque),
    })
    const t = titular as {
      tintaSobreLogo: number
      detrasDelTexto: { tintaSobreMasa: number; contrasteMediano: number }
    } | null
    console.log(
      `    ${c.clave.padEnd(20)} titular ${((t?.tintaSobreLogo ?? Number.NaN) * 100).toFixed(1).padStart(5)} %` +
        ` · DETRAS ${((t?.detrasDelTexto.tintaSobreMasa ?? Number.NaN) * 100).toFixed(1).padStart(5)} %` +
        ` · contraste ${(t?.detrasDelTexto.contrasteMediano ?? Number.NaN).toFixed(2).padStart(6)}:1` +
        ` · bloque ${dos(rect.bloque?.alto ?? 0).toFixed(1).padStart(6)} px` +
        ` · caja del titular ${dos(rect.titular?.ancho ?? 0).toFixed(0).padStart(4)}` +
        ` · L1 ${rect.linea1.renglones?.cantidad ?? 0}x${dos(rect.linea1.fontSize).toFixed(1)}` +
        ` · L2 ${rect.linea2.renglones?.cantidad ?? 0}x${dos(rect.linea2.fontSize).toFixed(1)}` +
        ` · bajada ${rect.bajada.renglones?.cantidad ?? 0}`,
    )
  }
  await medir<boolean>(pagina, PONER_CONFIGURACION(''))
  return filas
}

async function main(): Promise<void> {
  asegurarCarpetas()
  mkdirSync(CARPETA_DE_CAPTURAS_DEL_TEXTO, { recursive: true })
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const etiqueta = argumento('etiqueta', 'arbol')
  const conSims = argumento('sims', '') === '1'
  const soloAncho = argumento('ancho', '')
  const ventanas = soloAncho === '' ? VENTANAS : VENTANAS.filter((v) => String(v.ancho) === soloAncho)
  if (ventanas.length === 0) throw new Error(`ningun ancho coincide con --ancho=${soloAncho}`)
  const configuraciones = conSims ? [CONTROL, ...SIMULACIONES] : [CONTROL]

  const huecos = huecoEntreMasas()
  const filas: unknown[] = []
  const copias: Copia[] = []
  for (const v of ventanas) {
    const h = huecos.find((x) => x.ancho === v.ancho) ?? null
    console.log(`\n  ${v.ancho}x${v.alto}   hueco libre entre masas: ${h?.huecoLibre ?? 'sin segunda masa'}`)
    const resultados = await conChrome(`texto2-${v.ancho}`, async (chrome) =>
      enLaVentana(chrome, v, async ({ pagina }) => medirVentana(pagina, v, etiqueta, configuraciones, copias), {
        asentamientoMs: ASENTAMIENTO_MS,
      }),
    )
    filas.push({ ancho: v.ancho, alto: v.alto, hueco: h, configuraciones: resultados })
  }
  // Recién acá, con TODAS las pestañas cerradas.
  for (const c of copias) copyFileSync(c.desde, c.hasta)

  const salida = {
    etiqueta,
    cuando: new Date().toISOString(),
    instrumento:
      'scripts-texto/e-antes-despues.ts — el cruce de TAPADO-1 (C texto sin escena x D escena sola) sobre EL ARBOL, sin reglas encima salvo las simulaciones declaradas',
    huecoDeReferencia:
      'el hueco LIBRE sale de a-verdad-hoy.json: entre el fin de la masa 1 y el arranque de la masa 2 (bandas de 15 px o mas). No es lo que sobra hasta el borde.',
    filas,
  }
  const ruta = path.join(RAIZ_DE_SALIDAS, `e-${etiqueta}.json`)
  writeFileSync(ruta, `${JSON.stringify(salida, null, 2)}\n`, 'utf8')
  console.log(`\n  -> ${ruta}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
