/**
 * DOS COMPROBACIONES DE REPOSO, en una sola pasada.
 *
 *     npx tsx scripts-b4/s5-reposo.ts
 *
 *   1. **Portfolio descansa a media pantalla.** Se mide la caja de lo que se VE
 *      —el titular y su cuerpo—, no la del contenedor: el contenedor puede estar
 *      centrado y su contenido no, que es exactamente lo que pasaba.
 *   2. **«Nuestros servicios» llega con el gesto de la casa.** Se barre el tramo
 *      que el arranque de la secuencia le reserva y se anota dónde está el
 *      bloque del rótulo en cada paso: tiene que SUBIR y terminar quieto.
 */

import { cerrarChrome, lanzarChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from './navegador'
import { perfilPorId } from './perfiles'
import { paneles } from './sitio'

const URL_BASE = 'http://localhost:3000'
const PERFIL = perfilPorId('1440')

async function posarEn(p: Awaited<ReturnType<typeof abrirPagina>>, y: number, ms = 900): Promise<void> {
  await medir<number>(
    p,
    `(async () => {
      const hasta = performance.now() + ${String(ms)}
      while (performance.now() < hasta) {
        window.scrollTo(0, ${String(y)})
        await new Promise((r) => setTimeout(r, 60))
      }
      return window.scrollY
    })()`,
  )
}

interface Caja { readonly top: number; readonly alto: number; readonly centro: number }

async function principal(): Promise<void> {
  const chrome = await lanzarChrome({
    perfil: 'C:/Users/Valentino/.cache/b4-medicion/s5-reposo',
    ancho: PERFIL.ancho,
    alto: PERFIL.alto + 120,
  })
  try {
    const p = await abrirPagina(chrome)
    await emular(p, PERFIL)
    await irA(p, `${URL_BASE}/v3`)
    await verificarLaPagina(p, PERFIL)

    const lista = await paneles(p)
    const trabajos = lista.find((s) => s.id === 'trabajos')
    const servicios = lista.find((s) => s.id === 'servicios')
    if (trabajos === undefined || servicios === undefined) throw new Error('faltan paneles')

    // ── 1 · PORTFOLIO EN REPOSO ────────────────────────────────────────────
    // A mitad de la meseta del cartel: llegó y todavía no huye.
    await posarEn(p, trabajos.top + 1450)
    const cartel = await medir<Caja | null>(
      p,
      `(() => {
        const caja = document.querySelector('[data-pieza="cartel"]')
        if (caja === null) return null
        const hijos = [...caja.children].map((h) => h.getBoundingClientRect())
        const top = Math.min(...hijos.map((r) => r.top))
        const fondo = Math.max(...hijos.map((r) => r.bottom))
        return { top, alto: fondo - top, centro: (top + fondo) / 2 }
      })()`,
    )
    console.log(`\n1 · PORTFOLIO EN REPOSO  (cuadro de ${PERFIL.alto} px, la mitad cae en ${PERFIL.alto / 2})`)
    if (cartel === null) console.log('   no se encontro el cartel')
    else {
      console.log(`   lo que se ve: top ${cartel.top.toFixed(0)} · alto ${cartel.alto.toFixed(0)} · centro ${cartel.centro.toFixed(1)}`)
      console.log(`   contra la mitad de la pantalla: ${(cartel.centro - PERFIL.alto / 2).toFixed(1)} px  (${((cartel.centro / PERFIL.alto) * 100).toFixed(2)} % del alto)`)
    }

    // ── 2 · LA LLEGADA DEL ESTADO 00 ───────────────────────────────────────
    console.log(`\n2 · LA LLEGADA DE «NUESTROS SERVICIOS»  (los primeros 900 px del pin)`)
    console.log(`   ${'px del pin'.padStart(11)} ${'top del bloque'.padStart(15)} ${'visible'.padStart(9)}`)
    for (const px of [0, 150, 300, 450, 600, 750, 900, 1200]) {
      await posarEn(p, servicios.top + px, 700)
      const l = await medir<{ top: number; alto: number; recorte: number } | null>(
        p,
        `(() => {
          const ranura = document.querySelector('[data-estado="intro"]')
          if (ranura === null) return null
          const fila = ranura.querySelector('[data-fila="rotulo"]')
          const ventana = ranura.querySelector('span')
          if (fila === null || ventana === null) return null
          const r = fila.getBoundingClientRect()
          const v = ventana.getBoundingClientRect()
          return { top: r.top, alto: r.height, recorte: Math.max(0, r.bottom - v.bottom) }
        })()`,
      )
      if (l === null) { console.log(`   ${String(px).padStart(11)}   (no se encontro)`); continue }
      const visible = Math.max(0, l.alto - l.recorte)
      console.log(`   ${String(px).padStart(11)} ${l.top.toFixed(0).padStart(15)} ${`${((visible / l.alto) * 100).toFixed(0)} %`.padStart(9)}   (${l.recorte.toFixed(0)} px detras de la linea)`)
    }

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
