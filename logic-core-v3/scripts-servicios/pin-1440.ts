/**
 * LA GRABACIÓN DEL PIN DE SERVICIOS A 1440 — de «Nuestros servicios» hasta el
 * final del 03, cuadro por cuadro.
 *
 * ── Por qué un Chrome propio y no el del harness ──────────────────────────
 *
 * Porque son ~130 cuadros y cada uno sería una llamada de herramienta. Acá el
 * bucle vive adentro del proceso: se lanza el Chrome del banco de B4 —mismas
 * banderas, mismo lector de puerto— y se recorre el pin de una.
 *
 * ⚠️ **Perfil propio: `servicios`.** Dos procesos sobre el mismo `userDataDir`
 * y el segundo no arranca; `cdp.ts` ya lo dejó escrito y esto lo respeta.
 *
 * ⚠️ **El puerto es el 3006.** El 3000 lo tiene el dev de OTRO worktree
 * (`C:\rediseno-home`) y grabar ahí sería grabar el sitio de otra rama sin
 * enterarse — el mismo modo de falla que `b-comun.ts` documenta para el
 * 3001/3002, un lane más allá.
 *
 * ── Lo que verifica antes de grabar ───────────────────────────────────────
 *
 * `document.visibilityState` y que `innerWidth > 0`: con la pestaña ocluida el
 * navegador saltea los rendering steps y toda medición de scroll o de layout da
 * cero. Es la lección que este repo ya pagó, y acá invalidaría los 130 cuadros
 * de una.
 *
 * ── ⚠️ LOS CUADROS SUELTOS NO ENTRAN AL REPO, Y NO ES PROLIJIDAD ──────────
 *
 * 130 capturas de 1440×900 pesan ~69 MB, y `docs/` no está en `.gitignore`.
 * Ésa es exactamente la trampa que este repo ya documentó: la auto-detección de
 * fuentes de Tailwind 4 lee TODO lo que `.gitignore` no excluye, y un
 * directorio intruso lleno de bytes ajenos rompe el build señalando un archivo
 * sano. Así que los cuadros se escriben en el TEMP del sistema, se codifican, y
 * el directorio se borra en el `finally`. Al repo entra sólo el `.mp4` y este
 * JSON, que es el recibo de dónde estuvo el scroll en cada cuadro.
 */

import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { capturar } from '../scripts-b4/captura'
import { cerrarChrome, lanzarChrome, perfilDeChrome } from '../scripts-b4/cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, scrollA, verificarLaPagina } from '../scripts-b4/navegador'
import { perfilPorId } from '../scripts-b4/perfiles'

const ORIGEN = 'http://localhost:3006'
const SALIDAS = 'docs/rediseno/outputs/servicios'
const PELICULA = `${SALIDAS}/pin-1440.mp4`
const RECIBO = `${SALIDAS}/pin-1440-cuadros.json`

/** Cuadros por segundo de la película. 12 deja los 130 cuadros en ~11 s. */
const FPS = 12

/**
 * Cuántos cuadros de IDA.
 *
 * ⚠️ **Subió con el pin.** Eran 130 sobre un recorrido de 4.800 px —~37 px por
 * cuadro—; el pin pasó de 400svh a 700svh y el recorrido total a 7.500, así que
 * 130 dejarían 58 px por cuadro y la película se saltearía la mitad del gesto.
 * 200 devuelven los mismos ~37 px por cuadro que la grabación anterior, o sea
 * que las dos se pueden comparar cuadro contra cuadro.
 */
const CUADROS = 200

/**
 * Cuántos cuadros de VUELTA, subiendo.
 *
 * ⚠️ La vuelta no es un lujo de la grabación: la torta **despinta y rota al
 * revés**, y el rodillo dispara con el objetivo más bajo. Eso sólo se ve
 * subiendo, así que una grabación de una sola dirección no muestra la mitad
 * del gesto. Van menos cuadros que la ida —el paso es más grande— porque lo
 * que hay que ver es que reversa, no volver a leer los párrafos.
 */
const CUADROS_DE_VUELTA = 100

/**
 * Cuánto se muestra ANTES y DESPUÉS del pin.
 *
 * ⚠️ El «antes» es casi una pantalla entera a propósito: la entrada atenuada
 * —el bloque 01 con poco contraste, con el rodillo todavía en el estado 0— sólo
 * existe mientras la sección se ACERCA. Con 400 px la grabación empezaba ya
 * arriba del pin y esa mitad del gesto no se veía.
 */
const ANTES_PX = 900
const DESPUES_PX = 300

/** La geometría de la sección, leída del documento y no escrita acá. */
const LECTOR_DE_LA_SECCION = `(() => {
  const s = document.querySelector('#servicios')
  if (s === null) return null
  const r = s.getBoundingClientRect()
  return { top: Math.round(r.top + window.scrollY), alto: Math.round(r.height), ventana: window.innerHeight }
})()`

interface Seccion {
  readonly top: number
  readonly alto: number
  readonly ventana: number
}

async function principal(): Promise<void> {
  const perfil = perfilPorId('1440')
  mkdirSync(SALIDAS, { recursive: true })
  const cuadros = mkdtempSync(join(tmpdir(), 'pin-1440-'))

  const chrome = await lanzarChrome({ perfil: perfilDeChrome('servicios'), ancho: perfil.ancho, alto: perfil.alto })
  try {
    const pagina = await abrirPagina(chrome)
    await emular(pagina, perfil)
    await irA(pagina, `${ORIGEN}/v3`)
    const estado = await verificarLaPagina(pagina, perfil)
    if (estado.visibilityState !== 'visible' || estado.innerWidth === 0) {
      throw new Error(`pestaña no visible (${estado.visibilityState}, ${estado.innerWidth} px): los cuadros no valen`)
    }

    const seccion = await medir<Seccion | null>(pagina, LECTOR_DE_LA_SECCION)
    if (seccion === null) throw new Error('no se encontró #servicios en el documento')
    const pin = seccion.alto - seccion.ventana
    const desde = seccion.top - ANTES_PX
    const hasta = seccion.top + pin + DESPUES_PX

    // La ida entera, y después la vuelta hasta el arranque del pin.
    const recorrido: number[] = []
    for (let i = 0; i < CUADROS; i += 1) {
      recorrido.push(Math.round(desde + ((hasta - desde) * i) / (CUADROS - 1)))
    }
    for (let i = 1; i <= CUADROS_DE_VUELTA; i += 1) {
      recorrido.push(Math.round(hasta - ((hasta - desde) * i) / CUADROS_DE_VUELTA))
    }

    const filas: unknown[] = []
    for (let i = 0; i < recorrido.length; i += 1) {
      const pedido = recorrido[i]
      const logrado = await scrollA(pagina, pedido)
      // Un cuadro más: el rodillo y la columna cuelgan de un progreso
      // amortiguado y siguen moviéndose después de que el scroll se soltó.
      await medir(pagina, `(async () => { await new Promise((r) => setTimeout(r, 90)); return 1 })()`)
      const destino = join(cuadros, `${String(i).padStart(3, '0')}.png`)
      const bytes = await capturar(pagina, destino)
      filas.push({ i, pedido, logrado, bytes })
    }
    await cerrarPagina(pagina)

    execFileSync(
      'ffmpeg',
      ['-y', '-framerate', String(FPS), '-i', join(cuadros, '%03d.png'),
       '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', PELICULA],
      { stdio: 'ignore' },
    )

    writeFileSync(
      RECIBO,
      `${JSON.stringify(
        {
          que: 'el pin de servicios a 1440, de «Nuestros servicios» hasta el final del 03',
          cuando: new Date().toISOString(),
          origen: `${ORIGEN}/v3`,
          perfil: perfil.id,
          pelicula: PELICULA,
          fps: FPS,
          estado,
          seccion,
          pin,
          desde,
          hasta,
          pasoPx: Math.round((hasta - desde) / (CUADROS - 1)),
          cuadrosDeIda: CUADROS,
          cuadrosDeVuelta: CUADROS_DE_VUELTA,
          filas,
        },
        null,
        2,
      )}\n`,
      'utf8',
    )
    console.log(`${recorrido.length} cuadros (${CUADROS} de ida + ${CUADROS_DE_VUELTA} de vuelta) → ${PELICULA} — scroll ${desde} → ${hasta} → ${desde}, pin de ${pin} px`)
  } finally {
    await cerrarChrome(chrome)
    rmSync(cuadros, { recursive: true, force: true })
  }
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
