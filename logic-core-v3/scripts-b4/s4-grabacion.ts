/**
 * LA GRABACIÓN DEL RECORRIDO, A 1440 — bajando y volviendo, en una pasada.
 *
 *     npx tsx scripts-b4/s4-grabacion.ts
 *
 * ── ⚠️ POR QUÉ SCREENCAST Y NO `Page.captureScreenshot` ───────────────────
 *
 * El repo ya pagó que `captureScreenshot` **congela los pasos de render de la
 * página**: el `IntersectionObserver` deja de entregar y las transiciones de CSS
 * dejan de avanzar justo después de cada captura, y `requestAnimationFrame`
 * sigue resolviendo, así que el defecto no se nota por ese lado. Una tira de
 * capturas de un recorrido con estado vivo —que es exactamente lo que este
 * tramo tiene: un túnel que persigue, un CTA que tipea, un rodillo que dispara—
 * mostraría un sitio que no existe.
 *
 * `Page.startScreencast` no pide cuadros: los RECIBE a medida que el compositor
 * los pinta. No hay una llamada por cuadro y no hay nada que congelar.
 *
 * ── El recorrido ──────────────────────────────────────────────────────────
 *
 * Arranca un viewport antes de Trabajos y baja hasta pasado el final de
 * Servicios, y vuelve. El scroll lo hace la rueda de verdad
 * (`Input.dispatchMouseEvent` con `type: 'mouseWheel'`) y no un `scrollTo`: el
 * sitio corre con scroll suave, y un salto programático no reproduce ni la
 * inercia ni el ritmo con el que el tramo se va a ver.
 */

import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { cerrarChrome, lanzarChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from './navegador'
import { perfilPorId } from './perfiles'
import { paneles } from './sitio'

const URL_BASE = 'http://localhost:3000'
const PERFIL = perfilPorId('1440')
const SALIDA = process.env.SALIDA_DE_GRABACION ?? 'C:/Users/Valentino/.cache/b4-medicion/s4-grabacion'

/** Píxeles por golpe de rueda. Medido en B2: la rueda entrega 100 y Lenis los pasa derecho. */
const PX_POR_GOLPE = 100
/** Golpes por segundo, a ritmo de lectura. También de B2. */
const GOLPES_POR_SEGUNDO = 10

/**
 * ⚠️ **LOS CUADROS SE ESCRIBEN AL VUELO, Y ES POR QUÉ ESTO SE MORÍA.**
 *
 * Había un `interface Cuadro` y un arreglo que los juntaba para volcarlos al
 * disco al final. Con el recorrido corto pasaba; con el largo son ~3.700 JPEG
 * en base64 —del orden de 350 MB de cadenas vivas— y el harness mató la corrida
 * DOS veces por memoria del sistema, siempre cerca del final.
 *
 * No hay razón para juntarlos: el cuadro llega, se escribe y no se vuelve a
 * mirar. Así la memoria que ocupa la grabación entera es la de UN cuadro, y de
 * paso una corrida cortada deja en el disco todo lo que alcanzó a grabar.
 */

/**
 * ⚠️ **LOS CUADROS VAN A UNA CARPETA POR CORRIDA, y es una lección pagada.**
 *
 * Esto borraba la carpeta de salida entera como PRIMER paso, para no mezclar los
 * cuadros de dos corridas. Parece prolijo y es destructivo: una corrida que se
 * corta a mitad —y ésta se cortó dos veces, matada por el harness cuando la
 * máquina se quedó sin memoria— deja la carpeta vacía **y se lleva puesta la
 * grabación anterior, que estaba bien**. Borrar lo viejo antes de tener lo nuevo
 * es apostar a que la corrida termina.
 *
 * Ahora los cuadros van a una subcarpeta propia —que sí se limpia, porque es
 * suya— y el video queda arriba. Una corrida cortada no toca nada de lo que ya
 * había.
 */
const CUADROS = `${SALIDA}/cuadros`

async function principal(): Promise<void> {
  rmSync(CUADROS, { recursive: true, force: true })
  mkdirSync(CUADROS, { recursive: true })

  const chrome = await lanzarChrome({
    perfil: 'C:/Users/Valentino/.cache/b4-medicion/s4-grabacion-perfil',
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

    const arranque = Math.max(0, trabajos.top - PERFIL.alto)
    const final = servicios.top + servicios.alto
    console.log(`\ntrabajos: ${trabajos.top.toFixed(0)} +${trabajos.alto.toFixed(0)}  ·  servicios: ${servicios.top.toFixed(0)} +${servicios.alto.toFixed(0)}`)
    console.log(`recorrido: de ${arranque.toFixed(0)} a ${final.toFixed(0)} px y vuelta  —  ${(2 * (final - arranque)).toFixed(0)} px en total`)

    // Al punto de partida, sin grabar todavía.
    await medir<number>(
      p,
      `(async () => {
        window.scrollTo(0, ${String(arranque)})
        await new Promise((r) => setTimeout(r, 1200))
        return window.scrollY
      })()`,
    )

    let cuantos = 0
    p.conexion.al('Page.screencastFrame', (params) => {
      const datos = params.data as string
      const sessionId = params.sessionId as number
      writeFileSync(path.join(CUADROS, `c${String(cuantos).padStart(5, '0')}.jpg`), Buffer.from(datos, 'base64'))
      cuantos += 1
      void p.conexion.enviar('Page.screencastFrameAck', { sessionId }, p.sessionId)
    })

    await p.conexion.enviar(
      'Page.startScreencast',
      { format: 'jpeg', quality: 72, maxWidth: PERFIL.ancho, maxHeight: PERFIL.alto, everyNthFrame: 1 },
      p.sessionId,
    )

    const golpes = Math.ceil((final - arranque) / PX_POR_GOLPE)
    const msPorGolpe = 1000 / GOLPES_POR_SEGUNDO
    for (const signo of [1, -1]) {
      for (let g = 0; g < golpes; g += 1) {
        await p.conexion.enviar(
          'Input.dispatchMouseEvent',
          {
            type: 'mouseWheel',
            x: PERFIL.ancho / 2,
            y: PERFIL.alto / 2,
            deltaX: 0,
            deltaY: signo * PX_POR_GOLPE,
            pointerType: 'mouse',
          },
          p.sessionId,
        )
        await new Promise((r) => setTimeout(r, msPorGolpe))
      }
      // Que la inercia termine antes de dar la vuelta.
      await new Promise((r) => setTimeout(r, 1500))
    }

    await p.conexion.enviar('Page.stopScreencast', {}, p.sessionId)
    await new Promise((r) => setTimeout(r, 400))

    console.log(`
cuadros recibidos: ${cuantos}`)
    console.log(`escritos AL VUELO en ${CUADROS} (${readdirSync(CUADROS).length} archivos)`)
    console.log(`\n  ffmpeg -framerate 30 -i "${SALIDA}/c%05d.jpg" -c:v libx264 -pix_fmt yuv420p "${SALIDA}/recorrido-1440.mp4"`)

    await cerrarPagina(p)
  } finally {
    await cerrarChrome(chrome)
  }
}

principal().then(
  () => process.exit(0),
  (e: unknown) => {
    console.error(`\nSE CORTÓ: ${e instanceof Error ? e.message : String(e)}`)
    process.exit(1)
  },
)
