/**
 * PASADA FINAL · B3 — LA TRAZA DE TU PANEL: npx tsx scripts-pasada/b3-traza.ts [rotulo] [antesDeCargar]
 *
 * Una pasada de scroll suave de 9 s por Tu panel (con las ocho demos ya montadas por un paseo previo) con la traza de
 * Chrome prendida (la de DevTools: el hilo principal, el compositor, el raster y la GPU). Suma, por hilo, el tiempo de
 * cada tipo de trabajo, y para los cuadros que se pasan de 25 ms dice qué corría en el hilo principal en ese hueco.
 * El segundo argumento es un script que corre antes que la página (una perilla del banco). Va a
 * `~/.cache/b4-medicion/pasada-final/b3/traza-<rotulo>.json`. Pide el servidor y `BANCO_GPU=alta`.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { scrollSuave } from '../scripts-escena/clips6'
import { abrirBanco, esperar } from '../scripts-viajes/banco'

const ROTULO = process.argv[2] ?? 'base'
const ANTES = process.argv[3] ?? ''
const ALTO = 900
const CATEGORIAS = ['disabled-by-default-devtools.timeline.invalidationTracking', 'devtools.timeline', 'disabled-by-default-devtools.timeline', 'disabled-by-default-devtools.timeline.frame', 'toplevel', 'cc', 'gpu', 'viz', 'blink'].join(',')

/** Lo que sólo envuelve a otro trabajo: en un hueco se muestra lo de adentro (estilo, layout, pintura, el script). */
const ENVOLTORIOS = new Set(['RunTask', 'ThreadControllerImpl::RunTask', 'ProxyMain::BeginMainFrame', 'WebFrameWidgetImpl::BeginMainFrame', 'Blink.Animate.UpdateTime', 'PageAnimator::serviceScriptedAnimations', 'AsyncTask Run', 'FireAnimationFrame', 'FrameRequestCallbackCollection::ExecuteFrameCallbacks', 'FunctionCall', 'v8.callFunction', 'V8.Execute', 'Scheduler::RunTask', 'ScheduledAction::execute', 'TimerFire', 'EventDispatch', 'LocalFrameView::RunPostLifecycleSteps', 'LocalFrameView::UpdateLifecyclePhases', 'LocalFrameView::UpdateAllLifecyclePhases', 'Document::UpdateStyleAndLayout', 'LocalFrameView::RunStyleAndLayoutLifecyclePhases', 'LocalFrameView::RunPrePaintLifecyclePhase', 'LocalFrameView::RunPaintLifecyclePhase', 'PaintController::CommitNewDisplayItems'])

interface Evento { readonly name: string; readonly ph: string; readonly ts: number; readonly dur?: number; readonly pid: number; readonly tid: number; readonly args?: { readonly name?: string; readonly elementCount?: number; readonly data?: { readonly url?: string; readonly functionName?: string; readonly lineNumber?: number; readonly reason?: string; readonly nodeName?: string; readonly changedClass?: string; readonly changedAttribute?: string; readonly changedId?: string; readonly changedPseudo?: string; readonly invalidationList?: unknown; readonly invalidatedSelectorId?: string; readonly selectors?: unknown; readonly extraData?: string } } }

async function principal(): Promise<void> {
  const b = await abrirBanco(1440, ALTO, { perfil: 'pasada', antesDeCargar: `window.__entornoDeLaEscena = 'producto'; ${ANTES}` })
  const s = b.p.sessionId
  const eventos: Evento[] = []
  try {
    const seccion = await medir<{ top: number; alto: number }>(b.p, `(() => { const s = document.querySelector('[data-panel="tu-panel"]'); const r = s.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), alto: Math.round(r.height) } })()`)
    const [desde, hasta] = [seccion.top - ALTO, seccion.top + seccion.alto]
    await medir(b.p, `scrollTo(0, ${String(desde)})`)
    await esperar(1500)
    await scrollSuave(b, desde, hasta, 9000)
    await esperar(2500)
    await medir(b.p, `scrollTo(0, ${String(desde)})`)
    await esperar(1800)
    let completo: () => void = () => undefined
    const fin = new Promise<void>((r) => {
      completo = r
    })
    b.p.conexion.al('Tracing.dataCollected', (params) => {
      for (const e of params.value as Evento[]) eventos.push(e)
    })
    b.p.conexion.al('Tracing.tracingComplete', () => completo())
    await b.p.conexion.enviar('Tracing.start', { categories: CATEGORIAS, transferMode: 'ReportEvents' }, s)
    await esperar(300)
    await scrollSuave(b, desde, hasta, 9000)
    await esperar(300)
    await b.p.conexion.enviar('Tracing.end', {}, s)
    await fin
  } finally {
    await b.cerrar()
  }
  // Los hilos por nombre.
  const hilos = new Map<string, string>()
  for (const e of eventos) if (e.ph === 'M' && e.name === 'thread_name') hilos.set(`${String(e.pid)}:${String(e.tid)}`, e.args?.name ?? '?')
  const hiloDe = (e: Evento): string => hilos.get(`${String(e.pid)}:${String(e.tid)}`) ?? '?'
  const completos = eventos.filter((e) => e.ph === 'X' && typeof e.dur === 'number')
  const porHilo = new Map<string, Map<string, number>>()
  for (const e of completos) {
    const h = hiloDe(e).replace(/\d+$/, '')
    const m = porHilo.get(h) ?? new Map<string, number>()
    m.set(e.name, (m.get(e.name) ?? 0) + (e.dur ?? 0))
    porHilo.set(h, m)
  }
  const resumen: Record<string, [string, number][]> = {}
  for (const [h, m] of porHilo) resumen[h] = [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => [k, Math.round(v / 1000)])
  // Los cuadros: los BeginFrame del compositor del renderer; los huecos > 25 ms, con lo que corría en el principal.
  const principales = completos.filter((e) => hiloDe(e) === 'CrRendererMain')
  const comienzos = principales.filter((e) => e.name === 'ProxyMain::BeginMainFrame').map((e) => e.ts).sort((a, b) => a - b)
  // Los scripts que corren en el principal (FunctionCall), por archivo y función.
  const porScript = new Map<string, number>()
  for (const e of principales) {
    if (e.name !== 'FunctionCall') continue
    const d = e.args?.data
    const archivo = (d?.url ?? '?').split('/').slice(-2).join('/').split('?')[0]
    const k = `${d?.functionName ?? '?'} · ${archivo}:${String(d?.lineNumber ?? 0)}`
    porScript.set(k, (porScript.get(k) ?? 0) + (e.dur ?? 0))
  }
  const scripts = [...porScript.entries()].sort((a, b) => b[1] - a[1]).slice(0, 16).map(([k, v]) => [k, Math.round(v / 1000)] as const)
  const huecos: { readonly ms: number; readonly principal: [string, number][] }[] = []
  for (let k = 1; k < comienzos.length; k += 1) {
    const ms = (comienzos[k] - comienzos[k - 1]) / 1000
    if (ms <= 25) continue
    const dentro = new Map<string, number>()
    for (const e of principales) {
      if (ENVOLTORIOS.has(e.name)) continue
      const solape = Math.min(e.ts + (e.dur ?? 0), comienzos[k]) - Math.max(e.ts, comienzos[k - 1])
      if (solape > 0) dentro.set(e.name, (dentro.get(e.name) ?? 0) + solape)
    }
    huecos.push({ ms: Math.round(ms * 10) / 10, principal: [...dentro.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([n, v]) => [n, Math.round(v / 100) / 10]) })
  }
  // Las invalidaciones de estilo en los huecos: qué cambió y dónde (el rastreo de DevTools).
  const invalidaciones = new Map<string, number>()
  const marcas = eventos.filter((e) => /InvalidationTracking/.test(e.name))
  for (let k = 1; k < comienzos.length; k += 1) {
    if ((comienzos[k] - comienzos[k - 1]) / 1000 <= 25) continue
    for (const e of marcas) {
      if (e.ts < comienzos[k - 1] - 20000 || e.ts > comienzos[k]) continue
      const d = e.args?.data
      const k2 = `${e.name.replace('InvalidationTracking', '')} · ${d?.reason ?? ''} · ${d?.nodeName ?? ''} · ${d?.changedClass ?? d?.changedAttribute ?? d?.changedId ?? d?.changedPseudo ?? ''} ${d?.extraData ?? ''}`.slice(0, 160)
      invalidaciones.set(k2, (invalidaciones.get(k2) ?? 0) + 1)
    }
  }
  const causas = [...invalidaciones.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25)
  const cuentas = principales.filter((e) => e.name === 'UpdateLayoutTree' && (e.dur ?? 0) > 15000).map((e) => e.args?.elementCount ?? -1)
  const salida = { rotulo: ROTULO, causas, elementosEnLosGrandes: cuentas, eventos: eventos.length, cuadros: comienzos.length, huecos: huecos.length, resumen, scripts, peoresHuecos: [...huecos].sort((a, b) => b.ms - a.ms).slice(0, 12) }
  writeFileSync(`C:/Users/Valentino/.cache/b4-medicion/pasada-final/b3/traza-${ROTULO}.json`, JSON.stringify(salida, null, 1))
  console.log(JSON.stringify({ rotulo: ROTULO, eventos: eventos.length, cuadros: comienzos.length, huecos: huecos.length }))
  for (const h of ['CrRendererMain', 'Compositor', 'CompositorTileWorker', 'VizCompositorThread', 'CrGpuMain']) if (resumen[h] !== undefined) console.log(h, JSON.stringify(resumen[h].slice(0, 10)))
  for (const [k, v] of causas) console.log('causa', v, k)
  console.log('elementos recalculados en los recálculos grandes', JSON.stringify(cuentas.slice(0, 30)))
  for (const h of salida.peoresHuecos.slice(0, 8)) console.log('hueco', h.ms, JSON.stringify(h.principal))
}

if (process.argv[1]?.endsWith('b3-traza.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
