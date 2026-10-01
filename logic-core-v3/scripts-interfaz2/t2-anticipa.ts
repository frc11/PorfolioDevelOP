/**
 * SPRINT INTERFAZ 2 · T2 — la vista previa del destino en el menú (`anticipa=si`): la sonda y los clips.
 *
 *   `sonda`: con la bandera, desde el hero, el estado de la anticipación en CADA cuadro (lo que se suma a la luz y el
 *            giro de la cámara, con el scroll), leído en la página con `requestAnimationFrame`:
 *              1. el puntero sobre «Trabajos» 2,5 s (sube, se sostiene un segundo, vuelve) y se va;
 *              2. el puntero sobre «Trabajos» medio segundo y el clic: el viaje entero. El salto más grande entre dos
 *                 cuadros de lo anticipado tiene que ser chico (sin salto) y llegar en cero.
 *   `clips`: lado a lado sin la bandera y con ella: `hover-trabajos`, `hover-y-clic` y `desde-por-que` (sobre
 *            «Quiénes somos», que queda para arriba, y después sobre «Trabajos»).
 *
 * Uso: `npx tsx scripts-interfaz2/t2-anticipa.ts [sonda|clips]` (sin argumento, las dos).
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrir, armarClip, carpeta, centroDe, correr, esperar, grabar, ladoALado, raton, viajar, type Banco } from './banco'

const ITEM = (id: string): string => `[data-pieza="barra"] a[href="#${id}"]`
const CENTRO: [number, number] = [720, 600]

const MUESTREO = `(() => { window.__muestras = []; const paso = () => { const r = window.__respuestaDelBanco && window.__respuestaDelBanco(); if (r) window.__muestras.push({ t: performance.now(), y: scrollY, luz: r.luz, giro: r.giro, modo: r.modo }); window.__muestreo = requestAnimationFrame(paso) }; paso() })()`

async function sonda(): Promise<void> {
  const dir = carpeta('t2-anticipa')
  const b = await abrir(1440, 900, { pedido: 'producto,anticipa=si' })
  await raton(b, [700, 640], CENTRO, 4, 30)
  await esperar(2000)
  const trabajos = await centroDe(b, ITEM('trabajos'))
  if (trabajos === null) throw new Error('no está «Trabajos» en la barra')
  await medir(b.p, MUESTREO)
  // 1 · encima 2,5 s y se va
  const t0 = await medir<number>(b.p, 'performance.now()')
  await raton(b, CENTRO, trabajos, 10, 16)
  await esperar(2500)
  await raton(b, trabajos, CENTRO, 10, 16)
  await esperar(1500)
  // 2 · encima medio segundo y el clic
  const t1 = await medir<number>(b.p, 'performance.now()')
  await raton(b, CENTRO, trabajos, 10, 16)
  await esperar(500)
  const tClic = await medir<number>(b.p, 'performance.now()')
  await b.p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mousePressed', x: Math.round(trabajos[0]), y: Math.round(trabajos[1]), button: 'left', buttons: 1, clickCount: 1 }, b.p.sessionId)
  await b.p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mouseReleased', x: Math.round(trabajos[0]), y: Math.round(trabajos[1]), button: 'left', buttons: 0, clickCount: 1 }, b.p.sessionId)
  await esperar(4200)
  const muestras = await medir<{ t: number; y: number; luz: number; giro: number; modo: string }[]>(b.p, 'cancelAnimationFrame(window.__muestreo), window.__muestras')
  await b.cerrar()

  const tramo = (desde: number, hasta: number): typeof muestras => muestras.filter((m) => m.t >= desde && m.t < hasta)
  const resumen = (m: typeof muestras): Record<string, number> => {
    let [saltoLuz, saltoGiro] = [0, 0]
    for (let i = 1; i < m.length; i += 1) {
      saltoLuz = Math.max(saltoLuz, Math.abs(m[i].luz - m[i - 1].luz))
      saltoGiro = Math.max(saltoGiro, Math.abs(m[i].giro - m[i - 1].giro))
    }
    return { cuadros: m.length, luzMin: Math.min(...m.map((x) => x.luz)), giroMax: Math.max(...m.map((x) => x.giro)), saltoLuz, saltoGiro }
  }
  const encima = tramo(t0, t1)
  const alSegundo = (ms: number): (typeof muestras)[number] | undefined => encima.find((m) => m.t - t0 >= ms)
  const clic = tramo(t1, Number.POSITIVE_INFINITY)
  const despues = clic.filter((m) => m.t >= tClic)
  const salida = {
    placa: b.placa,
    encima: { ...resumen(encima), a300ms: alSegundo(300), a900ms: alSegundo(900), a1500ms: alSegundo(1500), a2400ms: alSegundo(2400) },
    clic: { ...resumen(clic), alClic: despues[0], ultimo: despues[despues.length - 1], modos: [...new Set(despues.map((m) => m.modo))] },
  }
  writeFileSync(`${dir}/sonda.json`, JSON.stringify({ ...salida, muestras }, null, 1))
  console.log(JSON.stringify(salida, null, 1))
}

type Gesto = (b: Banco) => Promise<void>
const GESTOS: Record<string, { preparar: Gesto; gesto: Gesto }> = {
  'hover-trabajos': {
    preparar: async (b) => {
      await raton(b, [700, 640], CENTRO, 4, 30)
      await esperar(2500)
    },
    gesto: async (b) => {
      await esperar(500)
      const t = await centroDe(b, ITEM('trabajos'))
      if (t === null) throw new Error('sin «Trabajos»')
      await raton(b, CENTRO, t, 12, 16)
      await esperar(2600)
      await raton(b, t, CENTRO, 12, 16)
      await esperar(1600)
    },
  },
  'hover-y-clic': {
    preparar: async (b) => {
      await raton(b, [700, 640], CENTRO, 4, 30)
      await esperar(2500)
    },
    gesto: async (b) => {
      await esperar(500)
      const t = await centroDe(b, ITEM('trabajos'))
      if (t === null) throw new Error('sin «Trabajos»')
      await raton(b, CENTRO, t, 12, 16)
      await esperar(600)
      await b.p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mousePressed', x: Math.round(t[0]), y: Math.round(t[1]), button: 'left', buttons: 1, clickCount: 1 }, b.p.sessionId)
      await b.p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mouseReleased', x: Math.round(t[0]), y: Math.round(t[1]), button: 'left', buttons: 0, clickCount: 1 }, b.p.sessionId)
      await esperar(4000)
    },
  },
  'desde-por-que': {
    preparar: async (b) => {
      await raton(b, [700, 640], CENTRO, 4, 30)
      await viajar(b, 'por-que-develop')
      await esperar(2500)
    },
    gesto: async (b) => {
      await esperar(500)
      const q = await centroDe(b, ITEM('quienes-somos'))
      const t = await centroDe(b, ITEM('trabajos'))
      if (q === null || t === null) throw new Error('sin los ítems')
      await raton(b, CENTRO, q, 12, 16)
      await esperar(1800)
      await raton(b, q, t, 8, 16)
      await esperar(2400)
      await raton(b, t, CENTRO, 12, 16)
      await esperar(1500)
    },
  },
}

async function clips(): Promise<void> {
  const dir = carpeta('t2-anticipa')
  for (const [nombre, g] of Object.entries(GESTOS)) {
    const hechos: string[] = []
    for (const [pedido, rotulo] of [['producto', 'sin la bandera'], ['producto,anticipa=si', 'con anticipa=si']] as const) {
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

correr(async () => {
  const que = process.argv[2]
  if (que === undefined || que === 'sonda') await sonda()
  if (que === undefined || que === 'clips') await clips()
})
