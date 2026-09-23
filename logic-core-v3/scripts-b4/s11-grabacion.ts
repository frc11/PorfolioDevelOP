/**
 * LA GRABACIÓN DE LA SALIDA, A 1440 — bajando por el vacío y subiendo.
 *
 *     npx tsx scripts-b4/s11-grabacion.ts
 *
 * Arranca con el CTA terminando de crecer, baja a ritmo de lectura hasta los
 * demos —el vacío nace en el centro, crece y deja la escena entera— y vuelve a
 * subir al mismo ritmo hasta el CTA: el vacío se achica y el túnel vuelve. Rueda
 * de verdad y screencast, por lo que dice `s4-grabacion.ts`; el video se arma
 * con la duración real de cada cuadro, como en `s10-grabacion.ts`.
 */

import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { cerrarChrome, lanzarChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from './navegador'
import { perfilPorId } from './perfiles'
import { paneles } from './sitio'

const PERFIL = perfilPorId('1440')
const SALIDA = 'C:/Users/Valentino/.cache/b4-medicion/s11-grabacion'
const CUADROS = `${SALIDA}/cuadros`
/** Ritmo de lectura: una muesca cada 250 ms (400 px/s, más lento que el efecto). */
const MS_POR_MUESCA = 250
/** Desde el CTA terminando de crecer hasta los demos, en px de la sección a 900. */
const ARRIBA = 3200
const ABAJO = 5300

type Pagina = Awaited<ReturnType<typeof abrirPagina>>

const esperar = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

async function hasta(p: Pagina, y: number, signo: 1 | -1): Promise<void> {
  for (let k = 0; k < 200; k += 1) {
    const ahora = await medir<number>(p, 'window.scrollY')
    if (signo > 0 ? ahora >= y : ahora <= y) return
    await p.conexion.enviar(
      'Input.dispatchMouseEvent',
      { type: 'mouseWheel', x: PERFIL.ancho / 2, y: PERFIL.alto / 2, deltaX: 0, deltaY: signo * 100, pointerType: 'mouse' },
      p.sessionId,
    )
    await esperar(MS_POR_MUESCA)
  }
}

async function principal(): Promise<void> {
  rmSync(CUADROS, { recursive: true, force: true })
  mkdirSync(CUADROS, { recursive: true })
  const chrome = await lanzarChrome({ perfil: 'C:/Users/Valentino/.cache/b4-medicion/s11-grabacion-perfil', ancho: PERFIL.ancho, alto: PERFIL.alto + 120 })
  try {
    const p = await abrirPagina(chrome)
    await emular(p, PERFIL)
    await irA(p, 'http://localhost:3000/v3')
    await verificarLaPagina(p, PERFIL)
    const t = (await paneles(p)).find((s) => s.id === 'trabajos')
    if (t === undefined) throw new Error('falta trabajos')
    const cero = t.top - PERFIL.alto
    const yArriba = cero + ARRIBA
    const yAbajo = cero + ABAJO
    // Al punto de partida de a muescas, para que la noche cruce su línea, y posado.
    await medir<number>(p, `(async () => { for (let y = ${String(cero - 1500)}; y <= ${String(yArriba)}; y += 150) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)) } const h = performance.now() + 3000; while (performance.now() < h) { window.scrollTo(0, ${String(yArriba)}); await new Promise((r) => setTimeout(r, 40)) } return 1 })()`)

    const instantes: number[] = []
    let cuantos = 0
    p.conexion.al('Page.screencastFrame', (params) => {
      const meta = params.metadata as { timestamp?: number } | undefined
      instantes.push(meta?.timestamp ?? Date.now() / 1000)
      writeFileSync(path.join(CUADROS, `c${String(cuantos).padStart(5, '0')}.jpg`), Buffer.from(params.data as string, 'base64'))
      cuantos += 1
      void p.conexion.enviar('Page.screencastFrameAck', { sessionId: params.sessionId as number }, p.sessionId)
    })
    await p.conexion.enviar('Page.startScreencast', { format: 'jpeg', quality: 72, maxWidth: PERFIL.ancho, maxHeight: PERFIL.alto, everyNthFrame: 1 }, p.sessionId)
    await esperar(1000)
    console.log('bajando por la salida')
    await hasta(p, yAbajo, 1)
    await esperar(2000)
    console.log('subiendo')
    await hasta(p, yArriba, -1)
    await esperar(2500)
    await p.conexion.enviar('Page.stopScreencast', {}, p.sessionId)
    await esperar(400)

    const lineas: string[] = []
    for (let i = 0; i < cuantos; i += 1) {
      const dura = i + 1 < instantes.length ? Math.max(0.001, instantes[i + 1] - instantes[i]) : 1 / 30
      lineas.push(`file 'cuadros/c${String(i).padStart(5, '0')}.jpg'`, `duration ${dura.toFixed(4)}`)
    }
    writeFileSync(`${SALIDA}/cuadros.txt`, `${lineas.join('\n')}\n`)
    const total = instantes.length > 1 ? instantes[instantes.length - 1] - instantes[0] : 0
    console.log(`cuadros: ${String(cuantos)} en ${total.toFixed(1)} s`)
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
