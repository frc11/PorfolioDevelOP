/**
 * SPRINT CALIDAD 1 — B2 · ¿quién reserva en cada cuadro? quien.ts <ancho> <alto> <funcion> [momento]
 *
 * Muestrea la memoria de V8 6 s con la escena quieta (en el hero o en la noche) y, para cada nodo del muestreo cuya
 * función es `funcion` (p. ej. `dispatchSetState`), imprime la cadena de llamadas que llega a él y cuánto reservó.
 */
import { medir } from '../../scripts-b4/navegador'
import { esperar } from '../../scripts-viajes/banco'
import { archivoDe, type NodoDeMemoria } from './analisis'
import { abrirMotor } from './abrir'

const [ANCHO, ALTO, FUNCION, MOMENTO] = [Number(process.argv[2] ?? 375), Number(process.argv[3] ?? 812), process.argv[4] ?? 'dispatchSetState', process.argv[5] ?? 'hero']

async function principal(): Promise<void> {
  const b = await abrirMotor(ANCHO, ALTO)
  const s = b.p.sessionId
  try {
    if (MOMENTO !== 'hero') {
      const y = await medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="trabajos"]').getBoundingClientRect(); return Math.round(r.top + scrollY + 0.85 * r.height) })()`)
      await medir(b.p, `window.__cuadrosDelBanco.recorrer(0, ${String(y)}, 1800)`)
    }
    await esperar(3000)
    await b.p.conexion.enviar('HeapProfiler.enable', {}, s)
    await b.p.conexion.enviar('HeapProfiler.startSampling', { samplingInterval: 1024 }, s)
    await esperar(6000)
    const { profile } = (await b.p.conexion.enviar('HeapProfiler.stopSampling', {}, s)) as { profile: { head: NodoDeMemoria } }
    const cadenas = new Map<string, number>()
    const recorrer = (n: NodoDeMemoria, pila: string[]): void => {
      const aca = `${n.callFrame.functionName || '(anónima)'} · ${archivoDe(n.callFrame.url)}:${String(n.callFrame.lineNumber + 1)}`
      const nueva = [...pila, aca]
      if (n.callFrame.functionName.startsWith(FUNCION)) {
        let total = 0
        const sumar = (m: NodoDeMemoria): void => {
          total += m.selfSize
          for (const h of m.children) sumar(h)
        }
        sumar(n)
        const k = nueva.slice(-9, -1).join('  <-  ')
        cadenas.set(k, (cadenas.get(k) ?? 0) + total)
      }
      for (const h of n.children) recorrer(h, nueva)
    }
    recorrer(profile.head, [])
    for (const [k, v] of [...cadenas.entries()].sort((a, c) => c[1] - a[1]).slice(0, 8)) console.log(`${String(Math.round(v / 1024))} KB en 6 s:  ${k.split('  <-  ').reverse().join('  <-  ')}\n`)
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('quien.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
