/**
 * [B1] LA GRABACIÓN EN VIVO — el plan B de `grabar.ts` (ajuste F de la aprobación: si el tiempo virtual no graba limpio un sitio,
 * `recordVideo` y seguir). Lo usa El Garage en el teléfono: en su catálogo la captura con el tiempo en pausa no volvía (tres
 * corridas, en cuadros distintos).
 *
 * Mismo guion, misma limpieza y misma pasada previa, pero en tiempo REAL: el recorrido lo hace la página con su propio reloj
 * (`requestAnimationFrame`) y Playwright graba la pantalla (`recordVideo`). Después, por tramo, ffmpeg recorta lo que fue antes del
 * recorrido, acelera a 2× y saca los cuadros a 30 por segundo en la misma carpeta que deja `grabar.ts`, así que `codificar.ts` no
 * cambia. Sólo GET: ningún clic, ningún formulario.
 *
 *   SLUG=el-garage DISPOSITIVO=movil npx tsx scripts-portfolio/grabarEnVivo.ts
 */
import { chromium, type BrowserContextOptions } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { CARPETA_DE_CUADROS, CUADROS_POR_SEGUNDO, GUIONES, PANTALLAS, SITIOS, scrollMaximo, segundosDelTramo, type Dispositivo, type SlugGrabado } from './guiones'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const UA_DEL_TELEFONO =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
const CSS_DE_LIMPIEZA = [
  '[id*="cookie" i]', '[class*="cookie" i]', '[id*="consent" i]', '[class*="consent" i]', '[aria-label*="cookie" i]',
  'iframe[title*="chat" i]', 'iframe[src*="chat" i]',
].join(', ') + ' { display: none !important; }'

/** El recorrido en la página, con su reloj: los movimientos del guion (en segundos de página, a 1×). Va como texto (tsx y `__name`). */
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

function opcionesDe(dispositivo: Dispositivo, dir: string): BrowserContextOptions {
  const p = PANTALLAS[dispositivo]
  // [B1.2b] P-H11 · `recordVideo` graba en píxeles CSS: con un tamaño de `ancho × escala` dejaba la página en el cuarto de arriba a la
  // izquierda y el resto gris. Al tamaño del viewport; la extracción de cuadros lo escala después (`scale` con lanczos).
  const video = { dir, size: { width: p.ancho, height: p.alto } }
  const base: BrowserContextOptions = { viewport: { width: p.ancho, height: p.alto }, deviceScaleFactor: p.escala, locale: 'es-AR', recordVideo: video }
  return dispositivo === 'movil' ? { ...base, isMobile: true, hasTouch: true, userAgent: UA_DEL_TELEFONO } : base
}

async function main(): Promise<void> {
  const slug = (process.env.SLUG ?? '') as SlugGrabado
  const dispositivo = (process.env.DISPOSITIVO ?? '') as Dispositivo
  const guion = GUIONES[slug]?.[dispositivo]
  if (guion === undefined) throw new Error('SLUG (el-garage|esquina-estudio|banu-scents) y DISPOSITIVO (escritorio|movil)')
  const pantalla = PANTALLAS[dispositivo]
  const carpeta = path.join(CARPETA_DE_CUADROS, `${slug}-${dispositivo}`)
  rmSync(carpeta, { recursive: true, force: true })
  const navegador = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--force_high_performance_gpu', '--hide-scrollbars', '--mute-audio'] })
  const informe: Record<string, unknown>[] = []
  try {
    for (const [n, tramo] of guion.entries()) {
      const crudo = path.join(carpeta, `crudo-${n}`)
      const contexto = await navegador.newContext(opcionesDe(dispositivo, crudo))
      const nace = Date.now()
      const pagina = await contexto.newPage()
      await pagina.goto(`${SITIOS[slug]}${tramo.ruta}`, { waitUntil: 'load', timeout: 90000 })
      await pagina.addStyleTag({ content: CSS_DE_LIMPIEZA })
      await pagina.waitForTimeout(3000)
      for (let y = 0; y <= scrollMaximo(tramo) + pantalla.alto; y += 300) {
        await pagina.evaluate(`window.scrollTo({ top: ${y}, behavior: 'instant' })`)
        await pagina.waitForTimeout(110)
      }
      await pagina.evaluate("window.scrollTo({ top: 0, behavior: 'instant' })")
      await pagina.waitForTimeout(1800)
      const arranca = (Date.now() - nace) / 1000
      await pagina.evaluate(`(${RECORRIDO})(${JSON.stringify(tramo.movimientos)})`)
      // El video de Playwright pierde el último segundo y pico al cerrar: sin esta espera la quietud del final salía cortada.
      await pagina.waitForTimeout(2000)
      await contexto.close()
      const webm = readdirSync(crudo).find((f) => f.endsWith('.webm'))
      if (webm === undefined) throw new Error(`sin video en ${crudo}`)
      const dir = path.join(carpeta, String(n))
      mkdirSync(dir, { recursive: true })
      const s = segundosDelTramo(tramo)
      execFileSync('ffmpeg', [
        '-hide_banner', '-loglevel', 'error', '-y', '-ss', arranca.toFixed(3), '-t', s.toFixed(3), '-i', path.join(crudo, webm),
        '-vf', `setpts=0.5*PTS,fps=${CUADROS_POR_SEGUNDO},scale=${pantalla.ancho * pantalla.escala}:${pantalla.alto * pantalla.escala}:flags=lanczos`,
        '-start_number', '0', path.join(dir, 'c%05d.png'),
      ])
      rmSync(crudo, { recursive: true, force: true })
      const cuadros = readdirSync(dir).length
      informe.push({ tramo: n, ruta: tramo.ruta, metodo: 'recordVideo', arranqueDelRecorridoS: arranca, cuadros })
      console.log(`[grabarEnVivo] ${slug} ${dispositivo} tramo ${n} (${tramo.ruta}): ${cuadros} cuadros (recordVideo, recorte en ${arranca.toFixed(2)} s)`)
    }
    writeFileSync(path.join(carpeta, 'informe.json'), JSON.stringify({ slug, dispositivo, tramos: informe }, null, 1))
    writeFileSync(path.join(carpeta, 'completo'), '')
  } finally {
    await navegador.close()
  }
}

void main()
