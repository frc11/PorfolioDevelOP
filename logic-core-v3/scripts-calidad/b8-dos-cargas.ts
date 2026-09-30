/**
 * SPRINT CALIDAD 1 — B8 · el precompilado en dos cargas seguidas del MISMO Chrome: b8-dos-cargas.ts [ancho alto]
 *
 * La primera carga compila (y guarda) los programas; la segunda, en la misma sesión, tendría que encontrarlos. Si la
 * segunda es rápida, lo lento de la primera es la compilación en frío (la de cualquier cambio de shaders en la primera
 * visita), no un costo del cambio.
 */
import { irA, medir } from '../scripts-b4/navegador'
import { esperar } from '../scripts-viajes/banco'
import { abrirMotor } from './motor/abrir'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]

async function principal(): Promise<void> {
  const b = await abrirMotor(ANCHO, ALTO)
  try {
    for (let carga = 1; carga <= 3; carga += 1) {
      if (carga > 1) {
        await irA(b.p, 'http://localhost:3000/v3')
        await esperar(4000)
      }
      let r: unknown = null
      for (let i = 0; i < 20 && r === null; i += 1) {
        await esperar(500)
        r = await medir<unknown>(b.p, 'window.__precompiladoDelBanco ?? null')
      }
      console.log(`carga ${String(carga)}: ${JSON.stringify(r)}`)
    }
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('b8-dos-cargas.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
