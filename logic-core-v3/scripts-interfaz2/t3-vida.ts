/**
 * SPRINT INTERFAZ 2 · T3 — la vida propia de las secciones opacas (`vida=si`): Tu panel y Servicios.
 *
 *   `clips`: lado a lado sin la bandera y con ella — `tu-panel` (la página quieta en el arranque de Tu panel: entran los
 *            pedidos, sube el contador) y `servicios` (la rueda recorre el pin: el proceso de cada servicio);
 *   `fotos`: con la bandera, Tu panel y Servicios quietos a 1440, con movimiento reducido (la tarjeta quieta) y a 390.
 *
 *   `cierre`: [cierre de INTERFAZ 2, sin bandera: la vida está en el producto] las fotos y un clip de cada una tal como
 *            quedaron (Tu panel sin el número, Servicios una vez por servicio), en `interfaz2/cierre/vida/`.
 *
 * Uso: `npx tsx scripts-interfaz2/t3-vida.ts [clips|fotos|cierre]` (sin argumento, las dos primeras).
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrir, armarClip, carpeta, correr, esperar, grabar, ladoALado, raton, rueda, type Banco } from './banco'

/** Llega a una sección con la rueda: un salto a 900 px antes de su tope y diez muescas. */
async function hasta(b: Banco, id: string, despues = 0): Promise<void> {
  const tope = await medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="${id}"]').getBoundingClientRect(); return Math.round(r.top + scrollY) })()`)
  await medir(b.p, `window.scrollTo(0, ${String(Math.max(0, tope - 1000 + despues))})`)
  await esperar(1200)
  await rueda(b, 10, 90)
  await esperar(2500)
}

const foto = async (b: Banco, archivo: string): Promise<void> => {
  const c = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
  writeFileSync(archivo, Buffer.from(c.data, 'base64'))
  await b.p.conexion.enviar('Emulation.setDeviceMetricsOverride', { width: b.ancho, height: b.alto, deviceScaleFactor: 1, mobile: b.ancho < 1024, screenWidth: b.ancho, screenHeight: b.alto }, b.p.sessionId)
}

const GESTOS: Record<string, { readonly preparar: (b: Banco) => Promise<void>; readonly gesto: (b: Banco) => Promise<void> }> = {
  'tu-panel': {
    preparar: async (b) => {
      await raton(b, [1400, 880], [1400, 880], 1, 0)
      await hasta(b, 'tu-panel', 120)
    },
    // El puntero se mueve despacio por un costado vacío: con la página quieta y la escena suspendida, el screencast no
    // manda cuadros si nada cambia (en la corrida sin la bandera no cambia nada).
    gesto: async (b) => {
      for (let k = 0; k < 9; k += 1) await raton(b, [1400, 880 - k * 6], [1400, 874 - k * 6], 30, 33)
    },
  },
  servicios: {
    preparar: async (b) => {
      await raton(b, [1400, 880], [1400, 880], 1, 0)
      await hasta(b, 'servicios', 300)
    },
    gesto: async (b) => {
      // El pin entero en ~13 s: de a tres muescas y una pausa, para ver cada servicio funcionando.
      for (let k = 0; k < 18; k += 1) {
        await rueda(b, 3, 90)
        await esperar(450)
      }
      await esperar(1500)
    },
  },
}

async function clips(): Promise<void> {
  const dir = carpeta('t3-vida')
  for (const [nombre, g] of Object.entries(GESTOS)) {
    const hechos: string[] = []
    for (const [pedido, rotulo] of [['producto', 'sin la bandera'], ['producto,vida=si', 'con vida=si']] as const) {
      const b = await abrir(1440, 900, { pedido })
      try {
        await g.preparar(b)
        const cuadros = await grabar(b, `${dir}/_cuadros-${nombre}`, () => g.gesto(b), 1200)
        const destino = `${dir}/${nombre}-${pedido === 'producto' ? 'sin' : 'con'}.mp4`
        armarClip(`${dir}/_cuadros-${nombre}`, cuadros, destino, `${nombre} - ${rotulo} - ${b.placa.includes('NVIDIA') ? 'NVIDIA' : b.placa}`)
        hechos.push(destino)
      } finally {
        await b.cerrar()
      }
    }
    ladoALado(hechos[0], hechos[1], `${dir}/${nombre}-sin-y-con.mp4`, 540)
    console.log(`${nombre}: listo`)
  }
}

async function fotos(dir = carpeta('t3-vida/fotos'), pedido = 'producto,vida=si'): Promise<void> {
  for (const [ancho, alto, reducido] of [[1440, 900, false], [1440, 900, true], [390, 844, false]] as const) {
    const b = await abrir(ancho, alto, { pedido, reducido })
    const rotulo = `${String(ancho)}${reducido ? '-reducido' : ''}`
    try {
      await hasta(b, 'tu-panel', ancho < 1024 ? 200 : 120)
      await esperar(3000)
      await foto(b, `${dir}/tu-panel-${rotulo}.png`)
      const caja = await medir<unknown>(b.p, `(() => { const e = document.querySelector('[data-pieza="panel-en-vivo"]'); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), texto: e.innerText.slice(0, 200) } })()`)
      console.log(rotulo, 'panel', JSON.stringify(caja))
      if (ancho >= 1024) {
        await hasta(b, 'servicios', 1600)
        await esperar(3500)
        await foto(b, `${dir}/servicios-${rotulo}.png`)
        const proceso = await medir<unknown>(b.p, `(() => { const e = document.querySelector('[data-pieza="proceso-en-vivo"]'); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), texto: e.innerText.slice(0, 200) } })()`)
        console.log(rotulo, 'proceso', JSON.stringify(proceso))
      }
    } finally {
      await b.cerrar()
    }
  }
}

async function cierre(): Promise<void> {
  const dir = carpeta('cierre/vida')
  await fotos(dir, 'producto')
  for (const [nombre, g] of Object.entries(GESTOS)) {
    const b = await abrir(1440, 900, { pedido: 'producto' })
    try {
      await g.preparar(b)
      const cuadros = await grabar(b, `${dir}/_cuadros-${nombre}`, () => g.gesto(b), 1200)
      armarClip(`${dir}/_cuadros-${nombre}`, cuadros, `${dir}/${nombre}.mp4`, `${nombre} - en el producto - ${b.placa.includes('NVIDIA') ? 'NVIDIA' : b.placa}`)
    } finally {
      await b.cerrar()
    }
  }
}

correr(async () => {
  const que = process.argv[2]
  if (que === 'cierre') return cierre()
  if (que === undefined || que === 'fotos') await fotos()
  if (que === undefined || que === 'clips') await clips()
})
