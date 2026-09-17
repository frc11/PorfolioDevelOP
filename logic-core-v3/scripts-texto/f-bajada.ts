/**
 * TEXTO-2 · F — ¿ENTRA LA BAJADA EN UN RENGLÓN? Las candidatas, medidas.
 *
 *     npx tsx scripts-texto/f-bajada.ts
 *
 * ── Por qué no alcanza con contar caracteres ──────────────────────────────
 *
 * `TEXTO-1` §7 D3 publica el presupuesto en CARACTERES —≤ 38 a 320, ≤ 40 a
 * 768— dividiendo el ancho de la caja por el avance MEDIO de la bajada de
 * entonces (6,7035 px por carácter). Ese promedio es una propiedad de **esa**
 * cadena: otra frase, con otras letras, tiene otro avance. Una candidata de 35
 * caracteres puede medir más que una de 38.
 *
 * Así que acá se miden las cadenas, no su largo: se le pone cada candidata al
 * párrafo real, con su tipografía real y en su caja real, y se cuenta cuántas
 * cajas de línea dibuja.
 *
 * ── ⚠️ EL CAMBIO DE TEXTO Y LA MEDICIÓN VAN EN LA MISMA EXPRESIÓN ─────────
 *
 * El párrafo vive en un árbol de React que vuelve a commitear mientras esto
 * corre —`tapado-comun.ts` lo declara para el atributo `style` y vale igual para
 * el texto—. Poner el texto en una llamada y medirlo en otra es una carrera que
 * se pierde callada: se mediría la cadena vieja. Acá se escribe, se lee y se
 * restaura adentro de UNA evaluación, y el instrumento verifica que la cadena
 * que midió es la que pidió.
 *
 * ── ⚠️ Y NO ES UNA MEDICIÓN DE ANCHO DE CAJA ─────────────────────────────
 *
 * El párrafo es hijo de un contenedor `flex-col items-start`, o sea que su caja
 * se encoge hasta el texto: `getBoundingClientRect().width` devuelve el ancho
 * del RENGLÓN, no el del lugar disponible. El ancho disponible se lee del PADRE,
 * que es la celda de la sub-grilla, y por eso la cuenta se hace contra él.
 */

import { writeFileSync } from 'node:fs'
import path from 'node:path'

import { medir, scrollA, type Pagina } from '../scripts-b4/navegador'
import {
  ASENTAMIENTO_MS,
  TEMP,
  VENTANAS,
  argumento,
  asegurarCarpetas,
  conChrome,
  dos,
  enLaVentana,
} from '../scripts-tapado/tapado-comun'
import { RAIZ_DE_SALIDAS } from './texto-comun'

void TEMP

/**
 * LAS CANDIDATAS. La primera es la de HOY —el control, que tiene que dar dos
 * renglones donde `a-desglose-hoy.json` midió dos— y las dos siguientes son las
 * que este sprint propone. La cuarta es la que estaba antes del recorte, para
 * que la tabla tenga el techo viejo adentro.
 */
const CANDIDATAS: readonly { readonly clave: string; readonly texto: string }[] = [
  { clave: 'hoy-49', texto: 'Tu sitio, tu chat y tu seguimiento en un sistema.' },
  { clave: 'A-35', texto: 'Tu sitio, tu chat y tu seguimiento.' },
  { clave: 'B-33', texto: 'Sitio, chat y seguimiento en uno.' },
]

interface Lectura {
  readonly texto: string
  readonly renglones: number
  readonly anchoDelRenglonMasLargo: number
  readonly anchoDisponible: number
  readonly cuerpo: number
  readonly caracteres: number
}

/**
 * Escribe la candidata, la mide y la restaura en UNA sola expresión. Devuelve
 * también el texto que efectivamente midió: si React lo pisó, la comprobación de
 * afuera lo ve en vez de creerle al número.
 */
function LEER(texto: string): string {
  return `(() => {
  const p = document.querySelector('[data-pantalla="hero"] [data-nivel="cuerpo"]')
    ?? document.querySelector('[data-pantalla="hero"] p')
  if (p === null) return null
  const original = p.textContent
  p.textContent = ${JSON.stringify(texto)}
  const padre = p.parentElement
  const disponible = padre === null ? 0 : padre.getBoundingClientRect().width
  const rango = document.createRange()
  rango.selectNodeContents(p)
  const rects = [...rango.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0.5)
  const topes = [...new Set(rects.map((r) => Math.round(r.top * 100) / 100))]
  const s = getComputedStyle(p)
  const leido = p.textContent
  p.textContent = original
  return {
    texto: leido,
    renglones: topes.length,
    anchoDelRenglonMasLargo: rects.length === 0 ? 0 : Math.max(...rects.map((r) => r.width)),
    anchoDisponible: disponible,
    cuerpo: parseFloat(s.fontSize),
    caracteres: leido === null ? 0 : leido.length,
  }
})()`
}

async function medirVentana(pagina: Pagina, ancho: number): Promise<unknown[]> {
  await scrollA(pagina, 0)
  await medir<boolean>(pagina, `(async () => { await new Promise((r) => setTimeout(r, 600)); return true })()`)
  const filas: unknown[] = []
  for (const c of CANDIDATAS) {
    const l = await medir<Lectura | null>(pagina, LEER(c.texto))
    if (l === null) throw new Error(`a ${ancho}: no se encontro la bajada`)
    if (l.texto !== c.texto) {
      throw new Error(
        `a ${ancho}, en «${c.clave}»: se midio «${l.texto}» y se habia pedido «${c.texto}». ` +
          'El arbol volvio a commitear entre la escritura y la lectura.',
      )
    }
    const avance = l.caracteres === 0 ? 0 : l.anchoDelRenglonMasLargo / l.caracteres
    const margen = l.anchoDisponible - l.anchoDelRenglonMasLargo
    filas.push({
      clave: c.clave,
      texto: c.texto,
      caracteres: l.caracteres,
      renglones: l.renglones,
      anchoDelTexto: dos(l.anchoDelRenglonMasLargo),
      anchoDisponible: dos(l.anchoDisponible),
      margen: dos(margen),
      avancePorCaracter: Number(avance.toFixed(4)),
      techoDeCaracteres: avance === 0 ? 0 : Math.floor(l.anchoDisponible / avance),
      cuerpo: l.cuerpo,
    })
    console.log(
      `    ${c.clave.padEnd(8)} ${String(l.caracteres).padStart(2)} car · ${l.renglones} rengl · ` +
        `${dos(l.anchoDelRenglonMasLargo).toFixed(1).padStart(6)} px de ${dos(l.anchoDisponible).toFixed(1).padStart(6)} ` +
        `· margen ${dos(margen).toFixed(1).padStart(7)} · avance ${avance.toFixed(3)} px/car ` +
        `· techo ${avance === 0 ? 0 : Math.floor(l.anchoDisponible / avance)} car`,
    )
  }
  return filas
}

async function main(): Promise<void> {
  asegurarCarpetas()
  const soloAncho = argumento('ancho', '')
  const ventanas = soloAncho === '' ? VENTANAS : VENTANAS.filter((v) => String(v.ancho) === soloAncho)
  const filas: unknown[] = []
  for (const v of ventanas) {
    console.log(`\n  ${v.ancho}x${v.alto}`)
    const resultados = await conChrome(`texto2-bajada-${v.ancho}`, async (chrome) =>
      enLaVentana(chrome, v, async ({ pagina }) => medirVentana(pagina, v.ancho), {
        asentamientoMs: ASENTAMIENTO_MS,
      }),
    )
    filas.push({ ancho: v.ancho, alto: v.alto, candidatas: resultados })
  }
  const ruta = path.join(RAIZ_DE_SALIDAS, 'f-bajada.json')
  writeFileSync(
    ruta,
    `${JSON.stringify(
      {
        cuando: new Date().toISOString(),
        instrumento:
          'scripts-texto/f-bajada.ts — cada candidata puesta en el parrafo real y contada con un Range; el ancho disponible se lee del PADRE porque la caja del parrafo se encoge (items-start)',
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
