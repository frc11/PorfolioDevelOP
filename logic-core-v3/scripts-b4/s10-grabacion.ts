/**
 * LA GRABACIÓN DEL SPRINT, A 1440 — el cambio de plano, la ráfaga y la vuelta.
 *
 *     npx tsx scripts-b4/s10-grabacion.ts
 *
 * El recorrido que el pedido nombra, con la rueda de verdad y por screencast (el
 * porqué de las dos cosas está en `s4-grabacion.ts`):
 *
 *   1. baja a ritmo de lectura desde antes de la noche: el barrido, el cambio de
 *      plano de la cámara y Portfolio llegando ni bien pasa;
 *   2. en el arranque del túnel, UNA RÁFAGA: diez muescas en 150 ms;
 *   3. sigue a ritmo de lectura hasta entrar a Servicios: el CTA, la espera corta
 *      y la salida;
 *   4. vuelve para arriba RÁPIDO —más rápido que el efecto— hasta Quiénes somos:
 *      el túnel desanda antes de que el cartel vuelva.
 *
 * Los cuadros del screencast llegan cuando el compositor pinta, no parejos: se
 * anota el instante de cada uno y el video se arma con esas duraciones, así el
 * tiempo del video es el del sitio.
 */

import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { cerrarChrome, lanzarChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from './navegador'
import { perfilPorId } from './perfiles'
import { paneles } from './sitio'

const PERFIL = perfilPorId('1440')
const SALIDA = 'C:/Users/Valentino/.cache/b4-medicion/s10-grabacion'
const CUADROS = `${SALIDA}/cuadros`
/** Ritmo de lectura: una muesca cada 250 ms (400 px/s, más lento que el efecto). */
const MS_DE_LECTURA = 250
/** La vuelta: una muesca cada 120 ms (833 px/s, más rápido que el efecto). */
const MS_DE_LA_VUELTA = 120

type Pagina = Awaited<ReturnType<typeof abrirPagina>>

async function muesca(p: Pagina, deltaY: number): Promise<void> {
  await p.conexion.enviar(
    'Input.dispatchMouseEvent',
    { type: 'mouseWheel', x: PERFIL.ancho / 2, y: PERFIL.alto / 2, deltaX: 0, deltaY, pointerType: 'mouse' },
    p.sessionId,
  )
}

const esperar = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/** Muescas a un ritmo hasta que el scroll cruce `hasta` en el sentido del signo. */
async function bajarHasta(p: Pagina, hasta: number, signo: 1 | -1, msPorMuesca: number): Promise<void> {
  for (let k = 0; k < 400; k += 1) {
    const y = await medir<number>(p, 'window.scrollY')
    if (signo > 0 ? y >= hasta : y <= hasta) return
    await muesca(p, signo * 100)
    await esperar(msPorMuesca)
  }
}

async function principal(): Promise<void> {
  rmSync(CUADROS, { recursive: true, force: true })
  mkdirSync(CUADROS, { recursive: true })
  const chrome = await lanzarChrome({ perfil: 'C:/Users/Valentino/.cache/b4-medicion/s10-grabacion-perfil', ancho: PERFIL.ancho, alto: PERFIL.alto + 120 })
  try {
    const p = await abrirPagina(chrome)
    await emular(p, PERFIL)
    await irA(p, 'http://localhost:3000/v3')
    await verificarLaPagina(p, PERFIL)
    const lista = await paneles(p)
    const trabajos = lista.find((s) => s.id === 'trabajos')
    const servicios = lista.find((s) => s.id === 'servicios')
    if (trabajos === undefined || servicios === undefined) throw new Error('faltan paneles')
    const inicio = trabajos.top - 1900
    const arranqueDelTunel = trabajos.top + 950
    const adentroDeServicios = servicios.top + 300
    console.log(`trabajos ${trabajos.top.toFixed(0)} +${trabajos.alto.toFixed(0)} · servicios ${servicios.top.toFixed(0)}`)

    // Al punto de partida de a muescas, para que el barrido de la noche cruce su línea.
    await medir<number>(p, `(async () => { for (let y = ${String(inicio - 1500)}; y <= ${String(inicio)}; y += 100) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)) } await new Promise((r) => setTimeout(r, 2500)); return window.scrollY })()`)

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
    await esperar(800)

    console.log('1 · a ritmo de lectura hasta el arranque del túnel')
    await bajarHasta(p, arranqueDelTunel, 1, MS_DE_LECTURA)
    console.log('2 · la ráfaga: diez muescas en 150 ms')
    for (let k = 0; k < 10; k += 1) {
      await muesca(p, 100)
      await esperar(15)
    }
    await esperar(3000)
    console.log('3 · a ritmo de lectura hasta entrar a Servicios')
    await bajarHasta(p, adentroDeServicios, 1, MS_DE_LECTURA)
    await esperar(1500)
    console.log('4 · la vuelta, rápida, hasta Quiénes somos')
    await bajarHasta(p, inicio, -1, MS_DE_LA_VUELTA)
    await esperar(2500)

    await p.conexion.enviar('Page.stopScreencast', {}, p.sessionId)
    await esperar(400)
    // El video se arma con la duración real de cada cuadro.
    const lineas: string[] = []
    for (let i = 0; i < cuantos; i += 1) {
      const dura = i + 1 < instantes.length ? Math.max(0.001, instantes[i + 1] - instantes[i]) : 1 / 30
      lineas.push(`file 'cuadros/c${String(i).padStart(5, '0')}.jpg'`, `duration ${dura.toFixed(4)}`)
    }
    writeFileSync(`${SALIDA}/cuadros.txt`, `${lineas.join('\n')}\n`)
    const total = instantes.length > 1 ? instantes[instantes.length - 1] - instantes[0] : 0
    console.log(`cuadros: ${String(cuantos)} en ${total.toFixed(1)} s`)
    console.log(`  cd "${SALIDA}" && ffmpeg -f concat -safe 0 -i cuadros.txt -vsync vfr -c:v libx264 -pix_fmt yuv420p recorrido-1440.mp4`)
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
