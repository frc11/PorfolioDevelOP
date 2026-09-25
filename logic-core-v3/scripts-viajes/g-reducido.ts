/**
 * SPRINT VIAJES — con movimiento reducido, ¿el viaje es un salto con un fundido corto?
 * g-reducido.ts <ancho> <alto>
 *
 * Emula `prefers-reduced-motion: reduce`, cliquea cada ítem desde el Hero y registra cuadro a
 * cuadro (rAF, en la página) el scroll y la opacidad del `<main>`: tiene que haber DOS posiciones
 * (la de salida y la de llegada, sin recorrido), un fundido que baja a 0 y vuelve, y la llegada en
 * el destino. Control positivo: la misma medición sin movimiento reducido ve decenas de posiciones.
 */
import { medir } from '../scripts-b4/navegador'
import { abrirBanco, esperar, scrollHasta, type Banco } from './banco'
import { clicEnElItem } from './b-humo'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]

const REGISTRAR = `(() => {
  window.__registro = []
  const main = document.querySelector('[data-v3] main')
  const t0 = performance.now()
  const cuadro = () => {
    window.__registro.push([Math.round(performance.now() - t0), Math.round(scrollY), Number(getComputedStyle(main).opacity)])
    if (performance.now() - t0 < 4000) requestAnimationFrame(cuadro)
  }
  requestAnimationFrame(cuadro)
  return 0
})()`

async function registrar(b: Banco, id: string): Promise<{ posiciones: number; opacidadMinima: number; fundidoMs: number; llegada: number; final: number }> {
  await scrollHasta(b, 0)
  await medir(b.p, REGISTRAR)
  await clicEnElItem(b, id)
  await esperar(4300)
  const r = await medir<[number, number, number][]>(b.p, 'window.__registro')
  const posiciones = new Set(r.map(([, y]) => y)).size
  const opacidades = r.map(([, , o]) => o)
  const bajo = r.filter(([, , o]) => o < 0.99)
  const fundidoMs = bajo.length === 0 ? 0 : bajo[bajo.length - 1][0] - bajo[0][0]
  return { posiciones, opacidadMinima: +Math.min(...opacidades).toFixed(3), fundidoMs, llegada: r[r.length - 1][1], final: +opacidades[opacidades.length - 1].toFixed(3) }
}

async function principal(): Promise<void> {
  const reducido = await abrirBanco(ANCHO, ALTO, { reducido: true, perfil: 'viajes-reducido' })
  try {
    for (const id of ['quienes-somos', 'trabajos', 'servicios', 'por-que-develop']) {
      console.log(JSON.stringify({ ancho: ANCHO, reducido: true, id, ...(await registrar(reducido, id)) }))
    }
  } finally {
    await reducido.cerrar()
  }
  const normal = await abrirBanco(ANCHO, ALTO, { perfil: 'viajes-reducido-control' })
  try {
    console.log(JSON.stringify({ ancho: ANCHO, reducido: false, control: 'servicios', ...(await registrar(normal, 'servicios')) }))
  } finally {
    await normal.cerrar()
  }
}
principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
