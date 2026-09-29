/**
 * SPRINT CALIDAD 1 — Fase 0 · la prueba del banco del motor: prueba.ts <ancho> <alto>
 * ¿Hay consultas de tiempo de la GPU? ¿Qué placa? ¿Cuánto tarda un cuadro en reposo en el hero sin vsync (y con)?
 * Y el perfil de la GPU por pasada en el hero.
 */
import { medir } from '../../scripts-b4/navegador'
import { esperar } from '../../scripts-viajes/banco'
import { abrirMotor } from './abrir'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]

async function cuadros(b: Awaited<ReturnType<typeof abrirMotor>>, ms: number): Promise<{ n: number; p50: number; p95: number; p99: number }> {
  await medir(b.p, 'window.__cuadrosDelBanco.empezar()')
  await esperar(ms)
  const r = await medir<{ t: number[] }>(b.p, 'window.__cuadrosDelBanco.parar()')
  const dt = r.t.slice(1).map((v, i) => v - r.t[i]).sort((a, c) => a - c)
  const q = (f: number): number => Math.round(dt[Math.min(dt.length - 1, Math.floor(f * dt.length))] * 100) / 100
  return { n: dt.length, p50: q(0.5), p95: q(0.95), p99: q(0.99) }
}

async function principal(): Promise<void> {
  for (const conVsync of [false, true]) {
    const b = await abrirMotor(ANCHO, ALTO, { conVsync })
    try {
      await esperar(2000)
      const placa = await medir<unknown>(b.p, `(() => { const c = document.createElement('canvas').getContext('webgl2'); const d = c.getExtension('WEBGL_debug_renderer_info'); return { placa: d ? c.getParameter(d.UNMASKED_RENDERER_WEBGL) : null, tiempos: c.getExtension('EXT_disjoint_timer_query_webgl2') !== null, perfil: window.__gpuDelBanco ? window.__gpuDelBanco.extension : null } })()`)
      console.log(JSON.stringify({ conVsync, placa }))
      console.log(JSON.stringify({ conVsync, reposoHero: await cuadros(b, 3000) }))
      console.log(JSON.stringify({ conVsync, contar: await medir<unknown>(b.p, 'window.__gpuDelBanco.contar(3000)') }))
      const cuadro = await medir<{ totalMs: number; pasadas: Record<string, { ms: number }> }>(b.p, "window.__gpuDelBanco.medir(120, 'cuadro')")
      const objetos = await medir<{ totalMs: number }>(b.p, "window.__gpuDelBanco.medir(120, 'objetos')")
      console.log(JSON.stringify({ conVsync, gpuCuadro: cuadro.pasadas, totalCuadro: cuadro.totalMs, totalObjetos: objetos.totalMs }))
      const errores = await medir<string[]>(b.p, 'window.__errores.filter((e) => !e.includes("LCP"))')
      console.log(JSON.stringify({ errores: errores.slice(0, 5) }))
    } finally {
      await b.cerrar()
    }
  }
}

if (process.argv[1]?.endsWith('prueba.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
