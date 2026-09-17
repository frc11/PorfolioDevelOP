/**
 * MOVIL-1 · F — EL CONTROL POSITIVO DE LA PARTICIÓN: la escena SÍ, la
 * coreografía NO.
 *
 *     npx tsx scripts-movil/f-coreografia.ts
 *
 * ── Por qué este script existe ────────────────────────────────────────────
 *
 * El sprint parte una compuerta en dos y el modo de falla no es que algo se
 * rompa: es que **las dos mitades sigan pegadas sin que nadie lo note**. Los
 * invariantes afirman la partición sobre el FUENTE —que la compuerta de la
 * escena ya no devuelve `null`, que las otras dos sí—, y eso es la mitad. La
 * otra mitad es el navegador, y sólo se puede ver ahí: **a 390 tiene que haber
 * canvas y NO tiene que haber ni motor de scroll, ni cursor propio, ni una sola
 * transformada de la coreografía.**
 *
 * Un check que sólo dijera «hay canvas» pasaría en verde aunque la coreografía
 * hubiera bajado con él. Por eso las cuatro lecturas van juntas y el veredicto
 * es la conjunción.
 *
 * ── Las huellas, y por qué cada una ───────────────────────────────────────
 *
 *   · `canvas` + `[data-escena]` — la escena montó.
 *   · `html.lenis` y el atributo `data-v3-scroll-suave` — si Lenis construyó,
 *     los escribe. Es la misma huella que `s18-compuertas` §3b nombra.
 *   · `[data-lineas-piezas]` — el divisor de líneas del sistema de motion. Si el
 *     árbol animado bajó, aparece.
 *   · **estilos INLINE de movimiento** en los paneles — el sistema de motion
 *     escribe `transform`/`opacity` en el atributo `style`; el árbol quieto no
 *     escribe ninguno.
 *
 * ── ⚠️ UNA HUELLA QUE ESTE SCRIPT USÓ MAL Y CORRIGIÓ, CON LOS DOS NÚMEROS ──
 *
 * La primera versión contaba **`transform` COMPUTADO distinto de `none`** y dio
 * **11 a 390**, o sea que declaró «la coreografía está presente» sobre un árbol
 * donde Lenis no construyó, el cursor no montó y `[data-lineas-piezas]` valía 0.
 * Los 11 eran `<span>` sin clase con matrices que se leen solas: **nueve son la
 * identidad** (`matrix(1,0,0,1,0,0)`), una es `scaleX(0)` y dos son una rotación
 * fija de 10°. Ninguna es movimiento: son utilidades de CSS del árbol QUIETO,
 * que declaran una transformada estática y por eso el computado deja de ser
 * `none`.
 *
 * O sea que la huella no distinguía «la coreografía bajó» de «hay una clase de
 * Tailwind con `rotate`». La que sí distingue es el atributo `style`: el sistema
 * de motion escribe inline, la hoja de estilos no. El computado se sigue
 * publicando —con su cifra— para que la corrección quede a la vista y nadie
 * vuelva a proponerlo como criterio.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

import { medir } from '../scripts-b4/navegador'
import { ASENTAMIENTO_MS, RAIZ_DE_SALIDAS, REGIMENES, conElHomeMovil } from './movil-comun'

interface Lectura {
  readonly canvas: boolean
  readonly escena: boolean
  readonly htmlTieneClaseLenis: boolean
  readonly atributoDeScrollSuave: boolean
  readonly cursorPropio: boolean
  readonly piezasDeLineas: number
  readonly conTransformada: number
  readonly computadasNoNone: number
  readonly detalleDeTransformadas: readonly { etiqueta: string; clase: string; transform: string }[]
  readonly secciones: number
}

const LECTURA = `(() => {
  const conT = [...document.querySelectorAll('main section, main section *')].filter((e) => {
    const s = e.getAttribute('style')
    return s !== null && /transform|translate|scale|rotate|opacity/.test(s)
  }).map((e) => ({
    etiqueta: e.tagName.toLowerCase(),
    clase: String(e.className).slice(0, 90),
    transform: String(e.getAttribute('style')).slice(0, 120),
  }))
  const computadasNoNone = [...document.querySelectorAll('main section, main section *')].filter((e) => {
    const t = getComputedStyle(e).transform
    return t !== 'none' && t !== ''
  }).length
  return {
    canvas: document.querySelector('canvas') !== null,
    escena: document.querySelector('[data-escena]') !== null,
    htmlTieneClaseLenis: document.documentElement.classList.contains('lenis'),
    atributoDeScrollSuave: document.querySelector('[data-v3-scroll-suave]') !== null,
    cursorPropio: document.querySelector('[data-pieza="cursor"]') !== null,
    piezasDeLineas: document.querySelectorAll('[data-lineas-piezas]').length,
    conTransformada: conT.length,
    computadasNoNone,
    detalleDeTransformadas: conT,
    secciones: document.querySelectorAll('main section').length,
  }
})()`

async function main(): Promise<void> {
  const fila = await conElHomeMovil(
    REGIMENES[0],
    async ({ pagina }) => {
      await medir<boolean>(pagina, `(async () => { await new Promise((r) => setTimeout(r, ${ASENTAMIENTO_MS})); return true })()`)
      return medir<Lectura>(pagina, LECTURA)
    },
    { quien: 'movil-coreo' },
  )

  const escenaOk = fila.canvas && fila.escena
  const coreografiaAusente =
    !fila.htmlTieneClaseLenis &&
    !fila.atributoDeScrollSuave &&
    !fila.cursorPropio &&
    fila.piezasDeLineas === 0 &&
    fila.conTransformada === 0

  console.log('\n  a 390×844, con la página asentada:')
  console.log(`    canvas en el DOM ................. ${fila.canvas ? 'SÍ' : 'NO'}   ← tiene que ser SÍ`)
  console.log(`    envoltorio [data-escena] ......... ${fila.escena ? 'SÍ' : 'NO'}   ← tiene que ser SÍ`)
  console.log(`    <html class="lenis"> ............. ${fila.htmlTieneClaseLenis ? 'SÍ' : 'NO'}   ← tiene que ser NO`)
  console.log(`    [data-v3-scroll-suave] ........... ${fila.atributoDeScrollSuave ? 'SÍ' : 'NO'}   ← tiene que ser NO`)
  console.log(`    cursor propio .................... ${fila.cursorPropio ? 'SÍ' : 'NO'}   ← tiene que ser NO`)
  console.log(`    [data-lineas-piezas] ............. ${fila.piezasDeLineas}    ← tiene que ser 0`)
  console.log(`    estilos INLINE de movimiento ..... ${fila.conTransformada}    ← tiene que ser 0`)
  console.log(`    (transform computado ≠ none) ..... ${fila.computadasNoNone}   ← se PUBLICA, no se exige: ver el docblock`)
  console.log(`    secciones en el <main> ........... ${fila.secciones}    (el contenido está entero)`)
  for (const t of fila.detalleDeTransformadas) console.log(`       · <${t.etiqueta}> ${t.transform}  ${t.clase}`)
  console.log(
    `\n  VEREDICTO: escena ${escenaOk ? 'MONTADA' : '⚠️ AUSENTE'} · coreografía ${coreografiaAusente ? 'AUSENTE' : '⚠️ PRESENTE'} — la partición ${escenaOk && coreografiaAusente ? 'se sostiene en el navegador' : 'NO se sostiene'}\n`,
  )

  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  writeFileSync(
    path.join(RAIZ_DE_SALIDAS, 'f-coreografia.json'),
    `${JSON.stringify({ cuando: new Date().toISOString(), ...fila, escenaOk, coreografiaAusente }, null, 2)}\n`,
    'utf8',
  )
}

main().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
