/**
 * L — LA BANDA MÓVIL, DESPUÉS DE APLICAR: mezcla, anchos, aviso y velo.
 *
 *     npx tsx scripts-blend/l-banda.ts [--anchos=320,375,425]
 *
 * Cuatro preguntas en una pasada, porque las cuatro se contestan en la misma pose:
 *
 *   1. **La mezcla del hero tomó** — `color` y `mix-blend-mode` computados del
 *      titular y de la bajada, y que el panel ya NO pinte papel opaco.
 *   2. **Los anchos** — la caja de cada texto contra el ancho útil de su
 *      contenedor. La cifra que importa es cuánto sobra a la derecha.
 *   3. **El aviso** — que exista, que esté DEBAJO de la foto (su `y` arranca
 *      después del borde de abajo de la imagen) y con qué animación.
 *   4. **El velo de la foto del equipo** — se toca de verdad para abrirlo y se
 *      compara el alto del contenido revelado contra el alto de la foto. Ése es
 *      el número que dice cuánto tiene que crecer, y sin él «lo necesario» es una
 *      opinión.
 */

import { medir } from '../scripts-b4/navegador'
import { VENTANAS, conChrome, enLaVentana, type Ventana } from '../scripts-tapado/tapado-comun'

import { argumento, guardarJson } from './blend-comun'

/** La foto del equipo es la ÚLTIMA de las tres: los dos retratos van antes. */
const LECTOR = `(() => {
  const caja = (el) => {
    if (el === null) return null
    const r = el.getBoundingClientRect()
    return { x: Math.round(r.x), y: Math.round(r.y), ancho: Math.round(r.width), alto: Math.round(r.height) }
  }
  const util = (el) => {
    let n = el === null ? null : el.parentElement
    while (n !== null) {
      const cs = getComputedStyle(n)
      const r = n.getBoundingClientRect()
      const dentro = r.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      if (dentro > 1) return Math.round(dentro)
      n = n.parentElement
    }
    return null
  }
  const conMezcla = (sel) => {
    const el = document.querySelector(sel)
    if (el === null) return null
    const cs = getComputedStyle(el)
    const c = caja(el)
    return { color: cs.color, blend: cs.mixBlendMode, caja: c, util: util(el), sobra: c === null ? null : (util(el) ?? 0) + 32 - (c.x + c.ancho) }
  }
  const panel = document.querySelector('[data-panel="hero"]')
  const marcos = [...document.querySelectorAll('[data-marco="dos-tomas"]')]
  const avisos = [...document.querySelectorAll('[data-aviso="toque"]')]
  const delEquipo = marcos.length === 0 ? null : marcos[marcos.length - 1]
  const avisoDelEquipo = avisos.length === 0 ? null : avisos[avisos.length - 1]
  const velo = delEquipo === null ? null : delEquipo.querySelector('div[aria-hidden="true"]:last-of-type > div')
  return {
    ventana: window.innerWidth,
    heroFondo: panel === null ? null : getComputedStyle(panel).backgroundColor,
    heroTitular: conMezcla('[data-panel="hero"] h1'),
    heroBajada: conMezcla('[data-panel="hero"] [data-nivel]'),
    qsTitular: conMezcla('[data-panel="quienes-somos"] [data-composicion="agencia"] div[aria-hidden="true"]'),
    qsBajada: conMezcla('[data-panel="quienes-somos"] [data-composicion="agencia"] p'),
    marcos: marcos.length,
    avisos: avisos.length,
    avisoTexto: avisoDelEquipo === null ? null : (avisoDelEquipo.textContent || '').trim(),
    avisoAnimacion: avisoDelEquipo === null ? null : getComputedStyle(avisoDelEquipo).animationName + ' ' + getComputedStyle(avisoDelEquipo).animationDuration,
    fotoDelEquipo: caja(delEquipo),
    avisoCaja: caja(avisoDelEquipo),
    veloContenido: caja(velo),
    centroDeLaFoto: (() => { const c = caja(delEquipo); return c === null ? null : { x: Math.round(c.x + c.ancho / 2), y: Math.round(c.y + c.alto / 2) } })(),
    visible: (() => { const c = caja(delEquipo); return c === null ? false : c.y > 0 && c.y + c.alto < window.innerHeight })(),
    topDocumento: (() => { const m = delEquipo; return m === null ? 0 : Math.round(m.getBoundingClientRect().top + window.scrollY) })(),
  }
})()`

interface Caja {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

interface ConMezcla {
  readonly color: string
  readonly blend: string
  readonly caja: Caja | null
  readonly util: number | null
  readonly sobra: number | null
}

interface Lectura {
  readonly ventana: number
  readonly heroFondo: string | null
  readonly heroTitular: ConMezcla | null
  readonly heroBajada: ConMezcla | null
  readonly qsTitular: ConMezcla | null
  readonly qsBajada: ConMezcla | null
  readonly marcos: number
  readonly avisos: number
  readonly avisoTexto: string | null
  readonly avisoAnimacion: string | null
  readonly fotoDelEquipo: Caja | null
  readonly avisoCaja: Caja | null
  readonly veloContenido: Caja | null
  readonly centroDeLaFoto: { readonly x: number; readonly y: number } | null
  readonly visible: boolean
  readonly topDocumento: number
}

function fila(que: string, m: ConMezcla | null): string {
  if (m === null) return `    ${que.padEnd(12)} (no está)`
  const c = m.caja
  return `    ${que.padEnd(12)} ${String(c?.ancho).padStart(4)} de ${String(m.util).padStart(4)} útiles · sobra ${String(m.sobra).padStart(4)} · ${m.color} · blend ${m.blend}`
}

async function principal(): Promise<void> {
  const pedidos = argumento('anchos', '320,375,425').split(',')
  const ventanas: readonly Ventana[] = VENTANAS.filter((v) => pedidos.includes(String(v.ancho)))
  const salida: Record<string, unknown>[] = []

  await conChrome('blend-banda', async (chrome) => {
    for (const v of ventanas) {
      const l = await enLaVentana(
        chrome,
        v,
        async (s) => {
          const antes = await medir<Lectura>(s.pagina, LECTOR)
          // Traer la foto del equipo al cuadro y tocarla de verdad: el velo se
          // mide abierto, que es cuando el contenido revelado tiene alto.
          await medir<number>(
            s.pagina,
            `(async () => { window.scrollTo(0, ${Math.max(0, antes.topDocumento - 120)}); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); return window.scrollY })()`,
          )
          await new Promise((r) => setTimeout(r, 900))
          const enPose = await medir<Lectura>(s.pagina, LECTOR)
          const centro = enPose.centroDeLaFoto
          if (centro !== null) {
            for (const tipo of ['mousePressed', 'mouseReleased']) {
              await s.pagina.conexion.enviar(
                'Input.dispatchMouseEvent',
                { type: tipo, x: centro.x, y: centro.y, button: 'left', clickCount: 1 },
                s.pagina.sessionId,
              )
            }
          }
          await new Promise((r) => setTimeout(r, 1200))
          const abierto = await medir<Lectura>(s.pagina, LECTOR)
          return { antes, enPose, abierto }
        },
        { asentamientoMs: 4500 },
      )

      console.log(`\n  === ${v.ancho}x${v.alto}`)
      console.log(`    hero: fondo ${l.antes.heroFondo}`)
      console.log(fila('hero titular', l.antes.heroTitular))
      console.log(fila('hero bajada', l.antes.heroBajada))
      console.log(fila('qs titular', l.antes.qsTitular))
      console.log(fila('qs bajada', l.antes.qsBajada))
      console.log(`    marcos ${l.antes.marcos} · avisos ${l.antes.avisos} · texto «${l.antes.avisoTexto}» · ${l.antes.avisoAnimacion}`)
      const f = l.enPose.fotoDelEquipo
      const a = l.enPose.avisoCaja
      if (f !== null && a !== null) {
        console.log(`    foto del equipo ${f.ancho}x${f.alto} en y=${f.y} · aviso en y=${a.y} (${a.y >= f.y + f.alto ? 'DEBAJO' : 'ENCIMA'})`)
      }
      const velo = l.abierto.veloContenido
      if (velo !== null && f !== null) {
        const sobra = f.alto - velo.alto
        console.log(`    velo abierto: contenido ${velo.ancho}x${velo.alto} contra foto de ${f.alto} de alto → ${sobra >= 0 ? `entra con ${sobra} px` : `SE DESBORDA por ${-sobra} px`}`)
      }
      salida.push({ ancho: v.ancho, ...l })
    }
    return null
  })
  console.log(`\n  ${guardarJson('l-banda', { anchos: salida })}`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
