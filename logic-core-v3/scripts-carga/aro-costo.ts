/**
 * [NOCTURNO B2] EL COSTO POR CUADRO DEL ARO DE LAS RESEÑAS, contra el dev server (una corrida = un Chrome nuevo, a la vista).
 *   BASE=http://localhost:3000 CORRIDA=1 npx tsx scripts-carga/aro-costo.ts
 * A 1440 × 900 (`ANCHO`/`ALTO` para otro), con el banco prendido (`__entornoDeLaEscena`: la escena publica `__aroDelBanco`):
 *   · la REFERENCIA: el scroll en la inserción del tramo (avance 0: la misma sala, la misma cámara, el aro sin entrar: no se dibuja);
 *   · el ARO: el scroll en la lectura (avance 0,65: el aro armado, girando).
 * En cada uno, 8 s quietos: los cuadros (rAF: fps, p95, > 50 ms), el hilo principal por segundo (TaskDuration y ScriptDuration, CDP) y el
 * costo de CPU del cuadro del aro (`costoMs`, muestreado). El control: en la referencia el aro no tiene placas visibles. Rotula la placa con
 * WEBGL_debug_renderer_info en la misma página. Criterio propuesto: el aro suma ≤ 0,5 ms de CPU por cuadro y no baja el p95.
 */
import { chromium, type CDPSession, type Page } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const CORRIDA = process.env.CORRIDA ?? '1'
const ANCHO = Number(process.env.ANCHO ?? 1440)
const ALTO = Number(process.env.ALTO ?? 900)
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PERFIL = `C:/Users/Valentino/.cache/b4-medicion/aro-costo-${CORRIDA}-${String(Date.now())}`
const dormir = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/** Dónde está el avance `r` del tramo de las reseñas (px de scroll): el pin de la sección + (2,5 + 4 r) pantallas (`resenas/tramo.ts`). */
const scrollDelAvance = (r: number): string => `(() => {
  const pin = document.querySelector('[data-pieza="escenario-del-final"]')?.parentElement
  if (!pin) return null
  return Math.round(pin.getBoundingClientRect().top + scrollY + (2.5 + 4 * ${String(r)}) * innerHeight)
})()`

async function metricas(cdp: CDPSession): Promise<Record<string, number>> {
  const { metrics } = (await cdp.send('Performance.getMetrics')) as { metrics: { name: string; value: number }[] }
  return Object.fromEntries(metrics.map((m) => [m.name, m.value]))
}

async function medir(p: Page, cdp: CDPSession, ms: number): Promise<Record<string, unknown>> {
  const a = await metricas(cdp)
  const t0 = Date.now()
  const r = await p.evaluate(`new Promise((resolver) => {
    const t = []; const costos = []; let antes = performance.now(); const fin = antes + ${String(ms)};
    const paso = (ahora) => { t.push(ahora - antes); antes = ahora;
      const aro = window.__aroDelBanco ? window.__aroDelBanco() : null; if (aro) costos.push(aro.costoMs);
      if (ahora < fin) requestAnimationFrame(paso); else {
        const o = [...t].sort((x, y) => x - y); const c = [...costos].sort((x, y) => x - y);
        const aro2 = window.__aroDelBanco ? window.__aroDelBanco() : null;
        resolver({ fps: Math.round(1000 * t.length / ${String(ms)}), p95: Math.round(o[Math.floor(o.length * 0.95)] * 10) / 10, largos: t.filter((x) => x > 50).length,
          aroMsMediana: c.length ? Math.round(c[Math.floor(c.length / 2)] * 1000) / 1000 : null, aroMsP95: c.length ? Math.round(c[Math.floor(c.length * 0.95)] * 1000) / 1000 : null,
          aro: aro2 }) } };
    requestAnimationFrame(paso) })`)
  const b = await metricas(cdp)
  const s = (Date.now() - t0) / 1000
  const porS = (n: string): number => Math.round(((b[n] - a[n]) / s) * 1000)
  return { ...(r as Record<string, unknown>), tareaMsPorS: porS('TaskDuration'), scriptMsPorS: porS('ScriptDuration') }
}

async function irA(p: Page, r: number): Promise<number | null> {
  const y = (await p.evaluate(scrollDelAvance(r))) as number | null
  if (y === null) return null
  await p.evaluate(`window.scrollTo({ top: ${String(y)}, behavior: 'instant' })`)
  await dormir(3500)
  return y
}

async function main(): Promise<void> {
  const args = [`--window-size=${String(ANCHO + 20)},${String(ALTO + 100)}`, '--window-position=0,0', '--no-first-run', '--mute-audio', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows']
  const ctx = await chromium.launchPersistentContext(PERFIL, { executablePath: CHROME, headless: false, viewport: { width: ANCHO, height: ALTO }, deviceScaleFactor: 1, args })
  await ctx.addInitScript(`(() => { try { sessionStorage.setItem('home:intro', '1') } catch (e) {} ; window.__entornoDeLaEscena = 'producto'; window.__name = window.__name || ((f) => f) })()`)
  const p = ctx.pages()[0] ?? (await ctx.newPage())
  const cdp = await ctx.newCDPSession(p)
  await cdp.send('Network.enable')
  await cdp.send('Network.setBlockedURLs', { urls: ['*/api/*'] })
  await cdp.send('Performance.enable')
  await p.goto(`${BASE}/v3`, { waitUntil: 'load', timeout: 240000 })
  await dormir(8000)
  const placa = await p.evaluate(`(() => { const gl = document.createElement('canvas').getContext('webgl2'); const ext = gl && gl.getExtension('WEBGL_debug_renderer_info'); return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'sin webgl' })()`)
  const visible = await p.evaluate('document.visibilityState')
  const yRef = await irA(p, 0)
  const referencia = await medir(p, cdp, 8000)
  const yAro = await irA(p, 0.65)
  const aro = await medir(p, cdp, 8000)
  const control = referencia.aro === null || (referencia.aro as { placasVisibles: number }).placasVisibles === 0
  console.log(JSON.stringify({ corrida: CORRIDA, cuadro: `${String(ANCHO)}x${String(ALTO)}`, placa, visible, yRef, yAro, control: control ? 'ok: sin placas en la referencia' : 'FALLA: la referencia dibuja el aro', referencia, aro }))
  await ctx.close()
}
void main()
