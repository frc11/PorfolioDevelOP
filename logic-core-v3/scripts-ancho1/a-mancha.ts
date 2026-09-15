/**
 * A · LA MANCHA DEL LOGO Y EL BORDE DERECHO DE LA TINTA — el hero en reposo,
 * ancho por ancho.
 *
 *     npx tsx scripts-ancho1/a-mancha.ts [--perfiles=1440x900,1920x1080]
 *
 * ── Qué mide, y con qué vara ──────────────────────────────────────────────
 *
 * Por cada viewport, con el scroll en 0 y la escena asentada, saca capturas del
 * mismo cuadro y no las mezcla nunca:
 *
 *   · **S — la sala desnuda.** Todo oculto menos `[data-escena]`. De ahí sale
 *     `siluetaMasGrande` con los umbrales de `scripts-b8/c-bloques.ts`
 *     (tinta < 60, área >= 5.000): **la misma máscara que nombra `s10-logo`** y
 *     con la que B8 y B11 publicaron. Da la mancha: su caja, su área, su ancho.
 *   · **T — el texto solo.** La escena oculta. De ahí sale el borde derecho de
 *     la TINTA: la última columna con píxel de glifo adentro de la caja del
 *     titular, que no es el borde de la caja de línea (la caja es casi todo
 *     fondo — `MEDICION-NAVEGADOR.md` §2).
 *   · **reposo** — el cuadro entero, sin ocultar nada. Es la evidencia.
 *
 * Y de S más la banda del texto sale **el borde seguro**, con la definición
 * textual de B1 (`B1-DELTAS.md` §4, citada en `hero/geometria.ts:50-79`): *la
 * primera columna de píxeles en la que más del 10 % de la banda vertical del
 * texto deja la tinta `#111111` por debajo de AA (4,5:1)*. No es «el primer
 * píxel oscuro»: la sala tiene motas sueltas por toda la pantalla y un punto de
 * 3 px no vuelve ilegible un renglón.
 *
 * ⚠️ **El búfer de WebGL no se lee desde la página.** Toda cifra de la escena
 * sale de `Page.captureScreenshot` de lo compuesto (`MEDICION-NAVEGADOR.md`).
 *
 * ⚠️ **Abajo de 1025 no hay escena y no es un cero: es un «no aplica».**
 * `_lib/compuerta.ts` no monta el canvas y el bundle ni se descarga. El
 * instrumento lo publica como tal en vez de escribir 0 px al lado de las demás.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { contraste, luminancia } from '../scripts-b4/color'
import { medir, scrollA } from '../scripts-b4/navegador'
import { moverElPuntero } from '../scripts-b5/pagina'
import { ASENTAMIENTO_MS, MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION, conLaPagina, type Sesion } from '../scripts-b8/b8-comun'
import { AREA_MINIMA_DEL_LOGO, TINTA_MAXIMA } from '../scripts-b8/c-bloques'
import { leerImagen, siluetaMasGrande, type Imagen } from '../scripts-b8/glifo-alfa'
import { ESCENA_NUESTRA, OCULTAR_NODOS, OCULTAR_TODO_MENOS } from '../scripts-b8/ocultar'

import { ORIGEN, TEMP, TODOS, argumento, asegurarCarpetas, perfilDeAncho1, red } from './ancho1-comun'

/** La tinta del tema (`_lib/superficies.ts`, `TINTA_HEX`). */
const TINTA: readonly [number, number, number] = [0x11, 0x11, 0x11]
const LUM_TINTA = luminancia(TINTA[0], TINTA[1], TINTA[2])
const AA = 4.5
/** La fracción de la banda vertical que tiene que caer bajo AA. B1 §4. */
const FRACCION_DEL_BORDE_SEGURO = 0.1
/** Un píxel es glifo si su canal más alto queda por debajo de esto. */
const UMBRAL_DE_GLIFO = 128
/** La escena tarda 300-700 ms en repintar tras un ocultamiento (B4-B, regla 1). */
const GRACIA_MS = 900

export interface Caja {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

interface CajaConTipo extends Caja {
  readonly tamano: string
  readonly familia: string
}

export interface LecturaDelDom {
  readonly innerWidth: number
  readonly innerHeight: number
  readonly dpr: number
  readonly scrollY: number
  readonly visibilityState: string
  readonly escenas: number
  readonly titular: Caja | null
  readonly linea1: CajaConTipo | null
  readonly linea2: CajaConTipo | null
  readonly bajada: Caja | null
  readonly panel: Caja | null
}

const LECTOR = [
  '(() => {',
  '  const caja = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, ancho: r.width, alto: r.height } }',
  '  const conTipo = (el) => { const c = caja(el); if (!c) return null; const s = getComputedStyle(el); return Object.assign(c, { tamano: s.fontSize, familia: s.fontFamily }) }',
  '  const t = document.querySelector("[data-titular]")',
  '  const hoja = t ? [...t.querySelectorAll("span")].filter((s) => s.querySelector("span") === null) : []',
  '  return {',
  '    innerWidth: window.innerWidth,',
  '    innerHeight: window.innerHeight,',
  '    dpr: window.devicePixelRatio,',
  '    scrollY: window.scrollY,',
  '    visibilityState: document.visibilityState,',
  '    escenas: document.querySelectorAll("[data-escena]").length,',
  '    titular: caja(t),',
  '    linea1: conTipo(hoja[0] || null),',
  '    linea2: conTipo(hoja[hoja.length - 1] || null),',
  '    bajada: caja(document.querySelector("[data-panel=\\"hero\\"] p")),',
  '    panel: caja(document.querySelector("[data-panel=\\"hero\\"]")),',
  '  }',
  '})()',
].join('\n')

export interface Mancha {
  readonly hay: boolean
  readonly area: number
  readonly x0: number
  readonly x1: number
  readonly y0: number
  readonly y1: number
  readonly anchoPx: number
  readonly altoPx: number
  readonly fraccionDelAncho: number
  readonly fraccionDelCuadro: number
}

const SIN_MANCHA: Mancha = {
  hay: false,
  area: 0,
  x0: Number.NaN,
  x1: Number.NaN,
  y0: Number.NaN,
  y1: Number.NaN,
  anchoPx: 0,
  altoPx: 0,
  fraccionDelAncho: 0,
  fraccionDelCuadro: 0,
}

export function mancha(S: Imagen): Mancha {
  const s = siluetaMasGrande(S, TINTA_MAXIMA, AREA_MINIMA_DEL_LOGO)
  if (s.caja.length === 0) return SIN_MANCHA
  const [x0, y0, x1, y1] = s.caja
  return {
    hay: true,
    area: s.area,
    x0,
    x1,
    y0,
    y1,
    anchoPx: x1 - x0 + 1,
    altoPx: y1 - y0 + 1,
    fraccionDelAncho: (x1 - x0 + 1) / S.ancho,
    fraccionDelCuadro: s.area / (S.ancho * S.alto),
  }
}

/** La última columna con glifo adentro de una caja del DOM, en la captura del texto. */
export function bordeDeLaTinta(T: Imagen, caja: Caja): number {
  const x0 = Math.max(0, Math.floor(caja.x))
  const x1 = Math.min(T.ancho - 1, Math.ceil(caja.x + caja.ancho))
  const y0 = Math.max(0, Math.floor(caja.y))
  const y1 = Math.min(T.alto - 1, Math.ceil(caja.y + caja.alto))
  for (let x = x1; x >= x0; x -= 1) {
    for (let y = y0; y <= y1; y += 1) {
      const k = (y * T.ancho + x) * 4
      if (Math.max(T.datos[k], T.datos[k + 1], T.datos[k + 2]) < UMBRAL_DE_GLIFO) return x
    }
  }
  return Number.NaN
}

/**
 * EL BORDE SEGURO, con la definición de B1 §4: la primera columna en la que más
 * del 10 % de la banda vertical del texto deja la tinta por debajo de AA.
 *
 * Se barre desde el borde izquierdo de la banda de texto hacia la derecha, sobre
 * la captura de la SALA DESNUDA: es la sala la que decide si el texto se lee, no
 * el texto.
 */
export function bordeSeguro(
  S: Imagen,
  banda: Caja,
  desdeX: number,
): { readonly x: number; readonly fraccion: number } {
  const y0 = Math.max(0, Math.floor(banda.y))
  const y1 = Math.min(S.alto - 1, Math.ceil(banda.y + banda.alto))
  const filas = Math.max(1, y1 - y0 + 1)
  for (let x = Math.max(0, Math.floor(desdeX)); x < S.ancho; x += 1) {
    let bajo = 0
    for (let y = y0; y <= y1; y += 1) {
      const k = (y * S.ancho + x) * 4
      if (contraste(LUM_TINTA, luminancia(S.datos[k], S.datos[k + 1], S.datos[k + 2])) < AA) bajo += 1
    }
    if (bajo / filas > FRACCION_DEL_BORDE_SEGURO) return { x, fraccion: bajo / filas }
  }
  return { x: Number.NaN, fraccion: 0 }
}

export interface Medida {
  readonly entereza: Entereza
  readonly dom: LecturaDelDom
  readonly mancha: Mancha
  readonly tintaHasta: number
  readonly bordeSeguroX: number
  readonly bordeSeguroFraccion: number
  readonly aireHastaLaMancha: number
  readonly aireHastaElBordeSeguro: number
}

export interface Fila extends Medida {
  readonly perfil: string
  readonly ancho: number
  readonly alto: number
  readonly aspecto: number
  readonly procedencia: string
}

const INTENTOS_DE_ENTEREZA = 6
const ESPERA_ENTRE_INTENTOS_MS = 1500
/**
 * ⚠️ **POR QUÉ ESTE BLOQUE NO USA `verificarQueLaPaginaEstaEntera` DE B5.**
 *
 * Aquél exige que los ocho paneles midan **múltiplos exactos del viewport**, y
 * eso es una propiedad del layout de escritorio **con un alto que le alcanza**.
 * Este bloque barre el ancho con el alto CLAVADO en 900, y ahí la propiedad se
 * cae por motivos que no son «la página está a medio compilar»: a 1024×900 las
 * secciones crecen con su contenido (2.902, 2.763, 2.085 px) porque abajo de
 * 1025 el layout es otro, y a 1920×900 dos paneles se pasan 103 y 89 px porque
 * el contenido no entra en 900 a ese ancho. Las dos son páginas sanas.
 *
 * El detector que este bloque necesita es el que contesta la pregunta que aquél
 * quería contestar —**¿hay hoja de estilos y fuentes?**— y la contesta directo:
 * los ocho paneles, el token del tema resuelto y las fuentes cargadas. Una
 * página sin CSS falla las tres. **Los desvíos de grilla se PUBLICAN en cada
 * fila en vez de tirar**: son un defecto de otro dueño y de otro sprint, y
 * esconderlos detrás de una excepción los borraría del reporte.
 */
interface Entereza {
  readonly paneles: number
  readonly tokenDelTema: string
  readonly fuentes: string
  readonly altoDelHero: number
  /** Paneles cuyo alto no es múltiplo del viewport, con cuánto se pasan. */
  readonly desvios: readonly { readonly alto: number; readonly sobra: number }[]
}

const LECTOR_DE_ENTEREZA = [
  '(() => {',
  '  const ps = [...document.querySelectorAll("[data-panel]")]',
  '  const hero = document.querySelector("[data-panel=\\"hero\\"]")',
  '  return {',
  '    paneles: ps.length,',
  '    altos: ps.map((x) => Math.round(x.getBoundingClientRect().height)),',
  '    tokenDelTema: getComputedStyle(document.documentElement).getPropertyValue("--container-tope").trim(),',
  '    fuentes: document.fonts ? document.fonts.status : "sin document.fonts",',
  '    altoDelHero: hero ? Math.round(hero.getBoundingClientRect().height) : -1,',
  '  }',
  '})()',
].join('\n')

async function entereza(s: Sesion): Promise<Entereza> {
  const e = await medir<{
    paneles: number
    altos: number[]
    tokenDelTema: string
    fuentes: string
    altoDelHero: number
  }>(s.pagina, LECTOR_DE_ENTEREZA)
  if (e.paneles !== 8) throw new Error(`hay ${e.paneles} paneles y tienen que ser 8`)
  if (e.tokenDelTema !== '1920px') throw new Error(`el tema no está aplicado: --container-tope = «${e.tokenDelTema}»`)
  if (e.fuentes !== 'loaded') throw new Error(`las fuentes no terminaron de cargar: ${e.fuentes}`)
  const desvios = e.altos
    .map((alto) => {
      const resto = alto % s.perfil.alto
      return { alto, sobra: Math.min(resto, s.perfil.alto - resto) }
    })
    .filter((d) => d.sobra > 0)
  return {
    paneles: e.paneles,
    tokenDelTema: e.tokenDelTema,
    fuentes: e.fuentes,
    altoDelHero: e.altoDelHero,
    desvios: s.perfil.debajoDelUmbral ? [] : desvios,
  }
}

async function asentar(s: Sesion): Promise<Entereza> {
  await esperarElPrimerCuadro(s.pagina)
  await new Promise((r) => setTimeout(r, ASENTAMIENTO_MS))
  let ultimo: unknown = null
  let salida: Entereza | null = null
  for (let intento = 1; intento <= INTENTOS_DE_ENTEREZA; intento += 1) {
    try {
      salida = await entereza(s)
      ultimo = null
      break
    } catch (e) {
      ultimo = e
      await new Promise((r) => setTimeout(r, ESPERA_ENTRE_INTENTOS_MS))
    }
  }
  if (ultimo !== null || salida === null) throw ultimo ?? new Error('sin lectura de entereza')
  await moverElPuntero(s.pagina, s.perfil, Math.round(s.perfil.ancho / 2), Math.round(s.perfil.alto / 2))
  return salida
}

async function unaMedida(s: Sesion): Promise<Medida> {
  const ent = await asentar(s)
  const y = await scrollA(s.pagina, 0)
  if (y !== 0) throw new Error(`el hero se mide en reposo y el scroll quedó en ${y}`)

  const dom = await medir<LecturaDelDom>(s.pagina, LECTOR)
  if (dom.visibilityState !== 'visible' || !(dom.innerWidth > 0)) {
    throw new Error(`pestaña no medible: ${dom.visibilityState} · innerWidth ${dom.innerWidth}`)
  }
  if (dom.innerWidth !== s.perfil.ancho || dom.innerHeight !== s.perfil.alto) {
    throw new Error(
      `el viewport quedó en ${dom.innerWidth}×${dom.innerHeight} y el perfil pide ${s.perfil.ancho}×${s.perfil.alto}`,
    )
  }
  if (dom.titular === null) throw new Error('el titular no está en el documento: sin él no hay borde de tinta')

  const nombre = `${s.perfil.ancho}x${s.perfil.alto}`
  const rutaS = path.join(TEMP, `S-${nombre}.png`)
  const rutaT = path.join(TEMP, `T-${nombre}.png`)
  const rutaR = path.join(TEMP, `reposo-${nombre}.png`)

  await capturar(s.pagina, rutaR)

  const hayEscena = dom.escenas > 0
  if (hayEscena) {
    const tomo = await medir<boolean>(s.pagina, OCULTAR_NODOS(ESCENA_NUESTRA, true))
    if (!tomo) throw new Error('no se pudo ocultar la escena para la captura del texto')
  }
  await capturar(s.pagina, rutaT)
  if (hayEscena) await medir<boolean>(s.pagina, OCULTAR_NODOS(ESCENA_NUESTRA, false))

  let M = SIN_MANCHA
  let bs = { x: Number.NaN, fraccion: 0 }
  if (hayEscena) {
    const tomo = await medir<boolean>(s.pagina, OCULTAR_TODO_MENOS('[]', ESCENA_NUESTRA, true))
    if (!tomo) throw new Error('no se pudo dejar la sala desnuda')
    await new Promise((r) => setTimeout(r, GRACIA_MS))
    await capturar(s.pagina, rutaS)
    await medir<boolean>(s.pagina, OCULTAR_TODO_MENOS('[]', ESCENA_NUESTRA, false))
    const S = leerImagen(rutaS)
    M = mancha(S)
    bs = bordeSeguro(S, dom.titular, dom.titular.x)
  }

  const tintaHasta = bordeDeLaTinta(leerImagen(rutaT), dom.titular)
  return {
    entereza: ent,
    dom,
    mancha: M,
    tintaHasta,
    bordeSeguroX: bs.x,
    bordeSeguroFraccion: bs.fraccion,
    aireHastaLaMancha: M.hay ? M.x0 - tintaHasta : Number.NaN,
    aireHastaElBordeSeguro: Number.isFinite(bs.x) ? bs.x - tintaHasta : Number.NaN,
  }
}

const ACUMULADO = path.join(TEMP, 'mancha.json')

async function principal(): Promise<void> {
  asegurarCarpetas()
  const pedidos = argumento('perfiles', TODOS.map((p) => `${p.ancho}x${p.alto}`).join(','))
    .split(',')
    .map((x) => x.trim())
    .filter((x) => x.length > 0)
    .map(perfilDeAncho1)

  const nuevas: Fila[] = []
  for (const perfil of pedidos) {
    process.stdout.write(`· ${perfil.ancho}×${perfil.alto} … `)
    const medida = await conLaPagina<Medida>(perfil, '/v3', unaMedida, {
      antesDelPintado: [PUENTE_DE_AUTOMATIZACION, MARCA_DE_INTRO],
      origen: ORIGEN,
      perfilDeChrome: 'ancho1',
    })
    const fila: Fila = {
      perfil: `${perfil.ancho}x${perfil.alto}`,
      ancho: perfil.ancho,
      alto: perfil.alto,
      aspecto: red(perfil.ancho / perfil.alto, 4),
      procedencia: perfil.procedencia,
      ...medida,
    }
    nuevas.push(fila)
    /** Se acumula fila por fila y no al final: una corrida que muere en el
     *  perfil siguiente no puede llevarse las que ya se midieron. */
    acumular(nuevas)
    console.log(
      medida.mancha.hay
        ? `mancha ${medida.mancha.anchoPx} px (${red(medida.mancha.fraccionDelAncho * 100, 2)} % del ancho) · x ${medida.mancha.x0}…${medida.mancha.x1} · tinta hasta ${medida.tintaHasta} · borde seguro ${medida.bordeSeguroX} · aire ${medida.aireHastaElBordeSeguro}`
        : `SIN ESCENA — la compuerta no monta el canvas · tinta hasta ${medida.tintaHasta}`,
    )
  }

  console.log(`\n→ ${ACUMULADO} (${acumular(nuevas)} filas)`)
}

/** Funde las filas nuevas con las que ya estaban y devuelve cuántas quedaron. */
function acumular(nuevas: readonly Fila[]): number {
  const previas: Fila[] = existsSync(ACUMULADO) ? (JSON.parse(readFileSync(ACUMULADO, 'utf8')) as Fila[]) : []
  const porClave = new Map(previas.map((f) => [f.perfil, f]))
  for (const f of nuevas) porClave.set(f.perfil, f)
  const todas = [...porClave.values()].sort((a, b) => a.ancho - b.ancho || a.alto - b.alto)
  writeFileSync(ACUMULADO, `${JSON.stringify(todas, null, 2)}\n`, 'utf8')
  return todas.length
}

void principal()
