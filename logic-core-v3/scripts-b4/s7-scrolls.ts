/**
 * LOS TIEMPOS DE PORTFOLIO, CONTADOS EN SCROLLS DE RUEDA.
 *
 *     npx tsx scripts-b4/s7-scrolls.ts
 *
 * El pedido de este sprint viene en la unidad del usuario: **muescas de rueda**.
 * Una muesca entrega 100 px y el scroll suave del sitio los pasa derecho, así
 * que un scroll = 100 px. Medir en píxeles y dividir a mano es exactamente el
 * tipo de traducción que pierde el acuerdo, así que este banco cuenta scrolls.
 *
 * Los tres que el pedido nombra:
 *
 *   (a) desde que la última imagen de «quiénes somos» deja de verse hasta que
 *       Portfolio aparece.                              hoy 11 · quiere 4 o 5
 *   (b) desde que Portfolio aparece hasta que la palabra está completa.
 *                                                        hoy 2 · quiere 3
 *   (c) desde que Portfolio empieza a irse hasta que salió del cuadro.
 *                                                        hoy 4 · quiere 2 o 3
 *
 * ── ⚠️ CÓMO SE DEFINE CADA EVENTO, para que el número signifique algo ─────
 *
 *   · «deja de verse» la foto: su borde de ABAJO cruza el tope del cuadro.
 *   · «aparece» Portfolio: su titular entra al cuadro por abajo, o sea su borde
 *     de arriba cruza el borde de abajo del cuadro.
 *   · «completa»: el titular no tiene ni un píxel tapado por la ventana que lo
 *     recorta. Es el final del gesto de llegada, no el de su ventana.
 *   · «empieza a irse»: la caja del cartel deja de estar en opacidad 1.
 *   · «salió»: la caja está escondida, o su borde de abajo cruzó el tope.
 *
 * ── ⚠️ Y SE BARRE CON EL SCROLL RE-PEDIDO EN CADA PASO ────────────────────
 *
 * El sitio corre con scroll suave: un `scrollTo` solo deja inercia que se va
 * sola, y a los pocos cientos de milisegundos la página está en otro lado. Cada
 * muestra re-pide la posición mientras espera, que es la receta que este banco
 * ya tiene pagada.
 */

import { cerrarChrome, lanzarChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from './navegador'
import { perfilPorId } from './perfiles'
import { paneles } from './sitio'

const URL_BASE = 'http://localhost:3000'
const PERFIL = perfilPorId('1440')

/** Lo que entrega una muesca de rueda, medido en B2 sobre el propio sitio. */
const PX_POR_SCROLL = 100
/** El paso del barrido. Un quinto de scroll: alcanza para no perder un evento. */
const PASO = 20

type Pagina = Awaited<ReturnType<typeof abrirPagina>>

async function posarEn(p: Pagina, y: number, ms = 420): Promise<void> {
  await medir<number>(
    p,
    `(async () => {
      const hasta = performance.now() + ${String(ms)}
      while (performance.now() < hasta) {
        window.scrollTo(0, ${String(y)})
        await new Promise((r) => setTimeout(r, 50))
      }
      return window.scrollY
    })()`,
  )
}

interface Muestra {
  readonly y: number
  /** Borde de abajo de la última foto de quiénes somos, en coordenadas del cuadro. */
  readonly fotoAbajo: number
  /** Borde de arriba del titular de Portfolio. */
  readonly titularArriba: number
  /** Borde de abajo del titular. */
  readonly titularAbajo: number
  /** Cuánto del titular queda tapado por la ventana que lo recorta. */
  readonly tapado: number
  /** La opacidad computada de la caja del cartel. */
  readonly opacidad: number
  /** Si la caja del cartel está escondida. */
  readonly escondido: boolean
}

const SONDA = `(() => {
  const fotos = [...document.querySelectorAll('[data-pantalla="foto"], [data-pieza-a="persona"]')]
  const ultima = fotos.length === 0 ? null : fotos[fotos.length - 1]
  const caja = document.querySelector('[data-pieza="cartel"]')
  const titular = caja === null ? null : caja.querySelector('h2')
  const ventana = caja === null ? null : caja.querySelector('[class*="overflow-hidden"]')
  if (titular === null || ventana === null || caja === null) return null
  const t = titular.getBoundingClientRect()
  const v = ventana.getBoundingClientRect()
  const e = getComputedStyle(caja)
  return {
    y: window.scrollY,
    fotoAbajo: ultima === null ? -99999 : ultima.getBoundingClientRect().bottom,
    titularArriba: t.top,
    titularAbajo: t.bottom,
    tapado: Math.max(0, t.bottom - v.bottom),
    opacidad: Number(e.opacity),
    escondido: e.visibility === 'hidden',
  }
})()`

function primeroQueCumple(
  muestras: readonly Muestra[],
  cumple: (m: Muestra) => boolean,
): Muestra | null {
  return muestras.find(cumple) ?? null
}

function enScrolls(desde: Muestra | null, hasta: Muestra | null): string {
  if (desde === null || hasta === null) return '(no se encontró)'
  const px = hasta.y - desde.y
  return `${(px / PX_POR_SCROLL).toFixed(1)} scrolls (${px} px)`
}

async function principal(): Promise<void> {
  const chrome = await lanzarChrome({
    perfil: 'C:/Users/Valentino/.cache/b4-medicion/s7-scrolls',
    ancho: PERFIL.ancho,
    alto: PERFIL.alto + 120,
  })
  try {
    const p = await abrirPagina(chrome)
    await emular(p, PERFIL)
    await irA(p, `${URL_BASE}/v3`)
    await verificarLaPagina(p, PERFIL)

    const lista = await paneles(p)
    const quienes = lista.find((s) => s.id === 'quienes-somos')
    const trabajos = lista.find((s) => s.id === 'trabajos')
    if (quienes === undefined || trabajos === undefined) throw new Error('faltan paneles')
    console.log(`\nquienes-somos top ${quienes.top.toFixed(0)} +${quienes.alto.toFixed(0)}`)
    console.log(`trabajos      top ${trabajos.top.toFixed(0)} +${trabajos.alto.toFixed(0)}`)

    // Desde bien adentro de quiénes somos hasta pasado el final del cartel.
    const desde = Math.max(0, quienes.top + quienes.alto - PERFIL.alto * 2)
    const hasta = trabajos.top + 2400
    console.log(`barriendo de ${desde} a ${hasta} de a ${PASO} px (${((hasta - desde) / PASO).toFixed(0)} muestras)\n`)

    const muestras: Muestra[] = []
    for (let y = desde; y <= hasta; y += PASO) {
      await posarEn(p, y)
      const m = await medir<Muestra | null>(p, SONDA)
      if (m !== null) muestras.push(m)
    }

    const seFueLaFoto = primeroQueCumple(muestras, (m) => m.fotoAbajo <= 0)
    const aparecePortfolio = primeroQueCumple(muestras, (m) => m.titularArriba <= PERFIL.alto && !m.escondido)
    const completa = aparecePortfolio === null
      ? null
      : primeroQueCumple(
          muestras.filter((m) => m.y >= aparecePortfolio.y),
          (m) => m.tapado <= 0.5,
        )
    const empiezaAIrse = completa === null
      ? null
      : primeroQueCumple(muestras.filter((m) => m.y > completa.y), (m) => m.opacidad < 0.99)
    const salio = empiezaAIrse === null
      ? null
      : primeroQueCumple(
          muestras.filter((m) => m.y > empiezaAIrse.y),
          (m) => m.escondido || m.titularAbajo <= 0,
        )

    const marca = (m: Muestra | null): string => (m === null ? '   ?   ' : String(m.y).padStart(7))
    console.log(`  se va la foto      y=${marca(seFueLaFoto)}`)
    console.log(`  aparece Portfolio  y=${marca(aparecePortfolio)}`)
    console.log(`  palabra completa   y=${marca(completa)}`)
    console.log(`  empieza a irse     y=${marca(empiezaAIrse)}`)
    console.log(`  salio del cuadro   y=${marca(salio)}`)
    console.log('')
    console.log(`  (a) foto -> Portfolio   ${enScrolls(seFueLaFoto, aparecePortfolio)}   (quiere 4 o 5)`)
    console.log(`  (b) aparece -> completa ${enScrolls(aparecePortfolio, completa)}   (quiere 3)`)
    console.log(`  (c) empieza -> salio    ${enScrolls(empiezaAIrse, salio)}   (quiere 2 o 3)`)

    await cerrarPagina(p)
  } finally {
    await cerrarChrome(chrome)
  }
}

principal().then(
  () => process.exit(0),
  (e: unknown) => {
    console.error(`\nSE CORTO: ${e instanceof Error ? e.message : String(e)}`)
    process.exit(1)
  },
)
