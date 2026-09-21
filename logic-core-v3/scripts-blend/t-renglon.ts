/**
 * T — ¿ENTRA «LAS 24 HS» EN UN RENGLÓN? ¿Y ENTRA «VALENTINO» EN SU COLUMNA?
 *
 *     npx tsx scripts-blend/t-renglon.ts
 *
 * Dos preguntas de la misma forma —una caja contra el texto que tiene que
 * contener— así que comparten banco y comparten método:
 *
 *   · **Cuántos renglones ocupa HOY.** Con un `Range` sobre el contenido del
 *     nodo: `getClientRects()` devuelve UN rect por caja de línea, así que su
 *     largo ES la cantidad de renglones. No hay que adivinar leyendo alturas ni
 *     comparar contra el interlineado.
 *   · **Cuánto mediría en UN renglón.** Se le pone `white-space: nowrap` en
 *     caliente, se mide, y se repone el valor anterior. Es lo único que contesta
 *     «¿entra?» antes de aplicar nada: el ancho de una caja que ya envolvió no
 *     dice cuánto necesitaba.
 *
 * El veredicto de cada fila es `necesita ≤ disponible`, con los dos números a la
 * vista para que el margen se pueda leer y no sólo el sí o el no.
 */

import { medir } from '../scripts-b4/navegador'
import { VENTANAS, conChrome, enLaVentana, type Ventana } from '../scripts-tapado/tapado-comun'

function esperar(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

const ANCHOS: readonly number[] = [320, 375, 425, 768, 1024, 1440, 1920]

/** El registro 2 del hero: «las 24 hs», que el CSS pone en mayúsculas. */
const LECTURA_DEL_TITULAR = `(() => {
  const h1 = document.querySelector('[data-panel="hero"] h1')
  if (h1 === null) return null
  // La pieza del registro 2 es la que lleva la cara itálica.
  const piezas = [...h1.querySelectorAll('span')]
  const pieza = piezas.find((p) => getComputedStyle(p).fontStyle === 'italic') ?? null
  if (pieza === null) return null

  const renglonesDe = (el) => {
    const r = document.createRange()
    r.selectNodeContents(el)
    return [...r.getClientRects()].filter((x) => x.width > 0)
  }
  const antes = renglonesDe(pieza)

  // Cuánto mediría en UN renglón, sin dejarlo puesto.
  const previo = pieza.style.whiteSpace
  pieza.style.whiteSpace = 'nowrap'
  const enUno = renglonesDe(pieza)
  const necesita = enUno.length > 0 ? Math.max(...enUno.map((x) => x.width)) : 0
  pieza.style.whiteSpace = previo

  const cajaDelH1 = h1.getBoundingClientRect()
  const cs = getComputedStyle(h1)
  const disponible = cajaDelH1.width - Number.parseFloat(cs.paddingLeft) - Number.parseFloat(cs.paddingRight)
  return {
    texto: (pieza.textContent ?? '').trim(),
    renglones: antes.length,
    necesita: Math.round(necesita * 100) / 100,
    disponible: Math.round(disponible * 100) / 100,
    tamano: Math.round(Number.parseFloat(getComputedStyle(pieza).fontSize) * 100) / 100,
    nowrapYaPuesto: getComputedStyle(pieza).whiteSpace,
  }
})()`

/** Los tres rótulos de la calle derecha, cada uno contra SU columna. */
const LECTURA_DE_LOS_NOMBRES = `(() => {
  const panel = document.querySelector('[data-panel="quienes-somos"]')
  if (panel === null) return []
  const nodos = [...panel.querySelectorAll('h3, h4')].filter((e) => e.getClientRects().length > 0)
  return nodos.map((el) => {
    const r = document.createRange()
    r.selectNodeContents(el)
    const rects = [...r.getClientRects()].filter((x) => x.width > 0)
    const previo = el.style.whiteSpace
    el.style.whiteSpace = 'nowrap'
    const r2 = document.createRange()
    r2.selectNodeContents(el)
    const enUno = [...r2.getClientRects()].filter((x) => x.width > 0)
    el.style.whiteSpace = previo
    const caja = el.getBoundingClientRect()
    return {
      texto: (el.textContent ?? '').trim().slice(0, 14),
      renglones: rects.length,
      necesita: Math.round((enUno.length > 0 ? Math.max(...enUno.map((x) => x.width)) : 0) * 100) / 100,
      disponible: Math.round(caja.width * 100) / 100,
      x: Math.round(caja.x),
    }
  })
})()`

interface Titular {
  readonly texto: string
  readonly renglones: number
  readonly necesita: number
  readonly disponible: number
  readonly tamano: number
  readonly nowrapYaPuesto: string
}
interface Nombre {
  readonly texto: string
  readonly renglones: number
  readonly necesita: number
  readonly disponible: number
  readonly x: number
}

function veredicto(necesita: number, disponible: number): string {
  const sobra = disponible - necesita
  return `${sobra >= 0 ? 'ENTRA' : 'NO ENTRA'} por ${Math.abs(Math.round(sobra * 100) / 100)} px`
}

async function principal(): Promise<void> {
  const ventanas: readonly Ventana[] = VENTANAS.filter((v) => ANCHOS.includes(v.ancho))

  await conChrome('blend-renglon', async (chrome) => {
    for (const v of ventanas) {
      await enLaVentana(
        chrome,
        v,
        async (s) => {
          const t = await medir<Titular | null>(s.pagina, LECTURA_DEL_TITULAR)
          if (t === null) {
            console.log(`  ${String(v.ancho).padStart(4)} · no se encontró el registro 2`)
          } else {
            console.log(
              `  ${String(v.ancho).padStart(4)} · «${t.texto}» ${t.renglones} renglón(es) · necesita ${t.necesita} de ${t.disponible} disponibles → ${veredicto(t.necesita, t.disponible)} · tamaño ${t.tamano}px · white-space ${t.nowrapYaPuesto}`,
            )
          }

          const top = await medir<number>(
            s.pagina,
            `(() => { const q = document.querySelector('[data-panel="quienes-somos"]'); return q === null ? 0 : Math.round(q.getBoundingClientRect().top + window.scrollY) })()`,
          )
          await medir<null>(s.pagina, `(() => { window.scrollTo(0, ${Math.max(0, top - 40)}); return null })()`)
          await esperar(1100)
          const nombres = await medir<Nombre[]>(s.pagina, LECTURA_DE_LOS_NOMBRES)
          for (const n of nombres) {
            console.log(
              `         «${n.texto}» x=${n.x} ${n.renglones} renglón(es) · necesita ${n.necesita} de ${n.disponible} → ${veredicto(n.necesita, n.disponible)}`,
            )
          }
          return null
        },
        { asentamientoMs: 4500 },
      )
    }
    return null
  })
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
