/**
 * PASADA FINAL · C1 — LA ESQUINA DEL INFINITO Y EL PARLANTE: npx tsx scripts-pasada/c1-esquina.ts [ancho alto]
 *
 * Captura la esquina de abajo a la derecha en el hero, en Tu panel y al final (donde la barra y el pie pueden caer cerca),
 * mide las cajas del infinito, del parlante y de lo que haya alrededor (la barra, el menú), y toca el parlante para ver el
 * cartel y el ícono. Va a `~/.cache/b4-medicion/pasada-final/c1/`. Pide el servidor de desarrollo.
 */
import { mkdirSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirBanco, captura, esperar } from '../scripts-viajes/banco'

const SALIDA = 'C:/Users/Valentino/.cache/b4-medicion/pasada-final/c1'
const [ANCHO, ALTO] = [Number(process.argv[2] ?? '1440'), Number(process.argv[3] ?? '900')]

const CAJAS = `(() => {
  const caja = (sel) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) } }
  return { infinito: caja('[data-pieza="infinito-del-recorrido"]'), parlante: caja('[data-pieza="control-del-sonido"]'), cartel: caja('[data-pieza="cartel-del-sonido"]'), barra: caja('[data-pieza="barra"]'), esquina: caja('[data-pieza="esquina-del-recorrido"]') }
})()`

const MUESTREO = `new Promise((listo) => {
  const boton = document.querySelector('[data-pieza="control-del-sonido"]')
  const t0 = performance.now()
  const filas = []
  const trazo = (el) => el === null ? null : (el.getAttribute('stroke-dasharray') ?? '') + ' @' + Number(getComputedStyle(el).opacity).toFixed(2)
  const cuadro = () => {
    const t = performance.now() - t0
    const g = boton.querySelectorAll('g')[1]
    const ondas = g.querySelectorAll('[data-parte="onda"]')
    const cruz = g.querySelectorAll('[data-parte="cruz"]')
    const cartel = document.querySelector('[data-pieza="cartel-del-sonido"]')
    filas.push([Math.round(t), trazo(ondas[0]), trazo(ondas[1]), trazo(cruz[0]), trazo(cruz[1]), cartel === null ? null : cartel.textContent + ' @' + Number(getComputedStyle(cartel).opacity).toFixed(2) + ' ' + getComputedStyle(cartel).transform])
    if (t < 2600) requestAnimationFrame(cuadro)
    else listo(filas)
  }
  boton.click()
  setTimeout(() => boton.click(), 400)
  requestAnimationFrame(cuadro)
})`

async function principal(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const b = await abrirBanco(ANCHO, ALTO, { perfil: 'pasada', antesDeCargar: `window.__entornoDeLaEscena = 'producto'` })
  const s = b.p.sessionId
  const informe: Record<string, unknown> = {}
  try {
    for (const [nombre, y] of [['hero', 0], ['medio', 12000], ['final', 999999]] as const) {
      await medir(b.p, `scrollTo(0, ${String(y)})`)
      await esperar(2500)
      informe[nombre] = await medir(b.p, CAJAS)
      await captura(b, `${SALIDA}/${String(ANCHO)}-${nombre}.png`)
    }
    // Tocar el parlante: el cartel y el ícono.
    const p = (informe.final as { parlante: { x: number; y: number; w: number; h: number } | null }).parlante
    if (p !== null) {
      const [x, y] = [p.x + p.w / 2, p.y + p.h / 2]
      await b.p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y }, s)
      await b.p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 }, s)
      await b.p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 }, s)
      await esperar(450)
      informe.alTocar = await medir(b.p, CAJAS)
      informe.estado = await medir(b.p, `(() => { const el = document.querySelector('[data-pieza="control-del-sonido"]'); const st = document.querySelector('[data-pieza="anuncio-del-sonido"]'); return { pressed: el?.getAttribute('aria-pressed'), estado: el?.getAttribute('data-estado'), anuncio: st ? st.textContent : null } })()`)
      await captura(b, `${SALIDA}/${String(ANCHO)}-al-tocar.png`)
      await esperar(2600)
      informe.despues = await medir(b.p, CAJAS)
      // El ícono y el cartel en el tiempo: dos toques a 400 ms (el cartel cambia), muestreados cada cuadro durante 2,6 s.
      informe.enElTiempo = await medir(b.p, MUESTREO)
    }
  } finally {
    writeFileSync(`${SALIDA}/${String(ANCHO)}.json`, JSON.stringify(informe, null, 1))
    console.log(JSON.stringify(informe))
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('c1-esquina.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
