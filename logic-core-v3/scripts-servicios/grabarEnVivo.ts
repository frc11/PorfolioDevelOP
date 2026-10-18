/**
 * [SERVICIOS M3] LA GRABACIÓN EN VIVO — el plan B de `grabar.ts`, con el enfoque de `scripts-portfolio/grabarEnVivo.ts` (leído, no
 * importado): si el tiempo virtual no graba limpia una demo, `recordVideo` en tiempo real y ffmpeg.
 *
 * Lo usa Skyline: con el reloj en pausa la captura dejó de volver en el cuadro 14, dos corridas seguidas (también con el latido de
 * `grabar.ts`). Mismo guion, misma limpieza y misma pasada previa; el recorrido lo hace la página con su propio reloj y Playwright
 * graba la pantalla. Después ffmpeg recorta lo de antes del recorrido, acelera a 2× y saca los cuadros a 30 por segundo en la misma
 * carpeta que deja `grabar.ts`, así que `montar.ts` no cambia. Solo GET: ningún clic, ningún formulario.
 *
 * `recordVideo` graba en píxeles CSS (P-H11 del Portfolio): en el teléfono los cuadros salen a 390 × 844 y se escalan con lanczos.
 *
 *   DEMO=skyline DISPOSITIVO=escritorio npx tsx scripts-servicios/grabarEnVivo.ts
 */
import { chromium, type BrowserContextOptions } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import {
  CARPETA_DE_CUADROS, CHROME, CSS_DE_LIMPIEZA, CUADROS_POR_SEGUNDO, DEMOS_GRABADAS, GUIONES, PANTALLAS, opcionesDe, scrollMaximo,
  segundosDelGuion, urlDeLaDemo, type DemoGrabada, type Dispositivo,
} from './guiones'

/** El recorrido en la página, con su reloj: los movimientos del guion, a 1×. Va como texto para que tsx no le meta sus ayudantes. */
const RECORRIDO = `(movimientos) => new Promise((listo) => {
  const suave = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
  const total = movimientos.reduce((s, m) => s + ('quieto' in m ? m.quieto : m.s), 0)
  const t0 = performance.now()
  const cuadro = (ahora) => {
    const t = (ahora - t0) / 1000
    let y = 0, desde = 0, fin = null
    for (const m of movimientos) {
      const dura = 'quieto' in m ? m.quieto : m.s
      if ('hasta' in m) {
        if (t < desde + dura) { fin = Math.round(y + (m.hasta - y) * suave((t - desde) / dura)); break }
        y = m.hasta
      } else if (t < desde + dura) { fin = y; break }
      desde += dura
    }
    window.scrollTo({ top: fin === null ? y : fin, behavior: 'instant' })
    if (t < total) requestAnimationFrame(cuadro)
    else listo(null)
  }
  requestAnimationFrame(cuadro)
})`

function conVideo(dispositivo: Dispositivo, dir: string): BrowserContextOptions {
  const p = PANTALLAS[dispositivo]
  return { ...opcionesDe(dispositivo), recordVideo: { dir, size: { width: p.ancho, height: p.alto } } }
}

async function main(): Promise<void> {
  const demo = (process.env.DEMO ?? '') as DemoGrabada
  const dispositivo = (process.env.DISPOSITIVO ?? '') as Dispositivo
  if (!DEMOS_GRABADAS.includes(demo) || !(dispositivo in PANTALLAS)) throw new Error(`DEMO (${DEMOS_GRABADAS.join('|')}) y DISPOSITIVO (escritorio|movil)`)
  const guion = GUIONES[demo][dispositivo]
  const pantalla = PANTALLAS[dispositivo]
  const carpeta = path.join(CARPETA_DE_CUADROS, `${demo}-${dispositivo}`)
  rmSync(carpeta, { recursive: true, force: true })
  const crudo = path.join(carpeta, 'crudo')
  const navegador = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--force_high_performance_gpu', '--hide-scrollbars', '--mute-audio'] })
  try {
    const contexto = await navegador.newContext(conVideo(dispositivo, crudo))
    const nace = Date.now()
    const pagina = await contexto.newPage()
    await pagina.goto(urlDeLaDemo(demo), { waitUntil: 'load', timeout: 90000 })
    await pagina.addStyleTag({ content: CSS_DE_LIMPIEZA })
    await pagina.waitForTimeout(3000)
    for (let y = 0; y <= scrollMaximo(guion) + pantalla.alto; y += 300) {
      await pagina.evaluate(`window.scrollTo({ top: ${y}, behavior: 'instant' })`)
      await pagina.waitForTimeout(110)
    }
    await pagina.evaluate("window.scrollTo({ top: 0, behavior: 'instant' })")
    await pagina.waitForTimeout(1800)
    const arranca = (Date.now() - nace) / 1000
    await pagina.evaluate(`(${RECORRIDO})(${JSON.stringify(guion)})`)
    // El video de Playwright pierde el último segundo y pico al cerrar (lo midió el Portfolio): se espera antes de cerrar.
    await pagina.waitForTimeout(2000)
    await contexto.close()
    const webm = readdirSync(crudo).find((f) => f.endsWith('.webm'))
    if (webm === undefined) throw new Error(`sin video en ${crudo}`)
    const s = segundosDelGuion(guion)
    execFileSync('ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-y', '-ss', arranca.toFixed(3), '-t', s.toFixed(3), '-i', path.join(crudo, webm),
      '-vf', `setpts=0.5*PTS,fps=${CUADROS_POR_SEGUNDO},scale=${pantalla.ancho * pantalla.escala}:${pantalla.alto * pantalla.escala}:flags=lanczos`,
      '-start_number', '0', path.join(carpeta, 'c%05d.png'),
    ])
    rmSync(crudo, { recursive: true, force: true })
    const cuadros = readdirSync(carpeta).filter((f) => f.endsWith('.png')).length
    const informe = { demo, dispositivo, url: urlDeLaDemo(demo), metodo: 'recordVideo', arranqueDelRecorridoS: arranca, cuadros }
    mkdirSync(carpeta, { recursive: true })
    writeFileSync(path.join(carpeta, 'informe.json'), JSON.stringify(informe, null, 1))
    writeFileSync(path.join(carpeta, 'completo'), '')
    console.log(`[grabarEnVivo] ${demo} ${dispositivo}: ${cuadros} cuadros (recordVideo, recorte en ${arranca.toFixed(2)} s)`)
  } finally {
    await navegador.close()
  }
}

main().catch((error: unknown) => {
  console.error('[grabarEnVivo] error:', error)
  process.exit(1)
})
