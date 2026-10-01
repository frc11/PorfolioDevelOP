/**
 * SPRINT INTERFAZ 1 — lo que comparten los bancos de este sprint: la carpeta de entregas (una por ticket), cómo se abre
 * /v3 (con una consulta en la URL: las variantes se piden ahí), el vigía de la carga (corrimientos del layout, el divisor
 * de líneas que se rehace a la vista, las fuentes) y cómo se graba y se arma un clip con el instante de cada cuadro.
 *
 * Contra el servidor de desarrollo, con un Chrome propio por CDP, con el vsync puesto (lo que se ve) y la NVIDIA
 * (`BANCO_GPU=alta`; la placa se lee en la página y va en cada resultado). El pedido de la escena es el producto.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'

import { cerrarChrome, lanzarChrome } from '../scripts-b4/cdp'
import { abrirPagina, cerrarPagina, irA, medir, type Pagina } from '../scripts-b4/navegador'
import { ERRORES } from '../scripts-escena/formacion'
import { esperar } from '../scripts-viajes/banco'

export { esperar }

/** Las entregas de este sprint. */
export const DIRI = 'C:/Users/Valentino/.cache/b4-medicion/interfaz1'

/** La carpeta de un ticket (o una subcarpeta), creada si no está. */
export function carpeta(nombre: string): string {
  const dir = `${DIRI}/${nombre}`
  mkdirSync(dir, { recursive: true })
  return dir
}

/**
 * EL VIGÍA — va antes de que cargue la página y no dibuja nada:
 *   · los corrimientos del layout (`layout-shift` sin entrada reciente), con el scroll y quién se corrió;
 *   · el divisor de líneas: cada vez que un bloque ya partido vuelve a medirse (`flex` → `invisible`), y si estaba a la
 *     vista (eso es un parpadeo: el texto desaparece un cuadro);
 *   · cuándo terminan de cargar las fuentes.
 */
const VIGIA = `(() => {
  const v = { cambios: [], fuentes: [], rehechos: 0, rehechosALaVista: 0, partidos: 0 }
  window.__vigia = v
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        if (e.hadRecentInput) continue
        const quien = []
        for (const s of (e.sources || [])) { const n = s.node; if (n && n.nodeType === 1) quien.push(n.nodeName + (n.id ? '#' + n.id : '') + (n.getAttribute('data-pieza') ? '[' + n.getAttribute('data-pieza') + ']' : '')) }
        v.cambios.push({ t: Math.round(e.startTime), valor: Math.round(e.value * 10000) / 10000, y: Math.round(scrollY), quien })
      }
    }).observe({ type: 'layout-shift', buffered: true })
  } catch (e) {}
  if (document.fonts) document.fonts.addEventListener('loadingdone', () => v.fuentes.push(Math.round(performance.now())))
  const mo = new MutationObserver((ms) => {
    for (const m of ms) {
      const el = m.target
      if (!(el instanceof Element) || !el.hasAttribute('data-lineas-piezas')) continue
      const ahora = String(el.getAttribute('class') || ''), antes = String(m.oldValue || '')
      if (antes.includes('flex') && ahora.includes('invisible')) {
        v.rehechos += 1
        const r = el.getBoundingClientRect()
        if (r.bottom > 0 && r.top < innerHeight && r.height > 0) v.rehechosALaVista += 1
      }
      if (ahora.includes('flex') && antes.includes('invisible')) v.partidos += 1
    }
  })
  const empezar = () => mo.observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true })
  if (document.documentElement) empezar(); else document.addEventListener('DOMContentLoaded', empezar)
})()`

export interface Banco {
  readonly p: Pagina
  readonly ancho: number
  readonly alto: number
  readonly placa: string
  readonly cerrar: () => Promise<void>
}

export interface OpcionesDelBanco {
  /** Lo que va después de `/v3` (p. ej. `?interfaz=cursor=nk`). */
  readonly consulta?: string
  readonly reducido?: boolean
  /** Sin el gancho del banco de la escena (`__entornoDeLaEscena`): la página exactamente como la abre una persona. */
  readonly comoUnaPersona?: boolean
}

/** Abre /v3 con el vigía puesto, la pestaña al frente y el ancho verificado. */
export async function abrir(ancho: number, alto: number, o: OpcionesDelBanco = {}): Promise<Banco> {
  const chrome = await lanzarChrome({ perfil: `C:/Users/Valentino/.cache/b4-medicion/interfaz1-${String(ancho)}`, ancho: ancho + 40, alto: alto + 140 })
  const p = await abrirPagina(chrome)
  const s = p.sessionId
  await p.conexion.enviar('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: o.reducido === true ? 'reduce' : 'no-preference' }] }, s)
  await p.conexion.enviar('Emulation.setDeviceMetricsOverride', { width: ancho, height: alto, deviceScaleFactor: 1, mobile: ancho < 1024, screenWidth: ancho, screenHeight: alto }, s)
  const gancho = o.comoUnaPersona === true ? '' : "window.__entornoDeLaEscena = 'producto';"
  await p.conexion.enviar('Page.addScriptToEvaluateOnNewDocument', { source: `${gancho} ${ERRORES}; ${VIGIA}` }, s)
  await irA(p, `http://localhost:3000/v3${o.consulta ?? ''}`)
  await esperar(4000)
  let estado = await medir<{ visible: string; ancho: number }>(p, '({ visible: document.visibilityState, ancho: innerWidth })')
  for (let intento = 0; intento < 4 && estado.visible !== 'visible'; intento += 1) {
    await p.conexion.enviar('Page.bringToFront', {}, s)
    await esperar(1500)
    estado = await medir<{ visible: string; ancho: number }>(p, '({ visible: document.visibilityState, ancho: innerWidth })')
  }
  if (estado.visible !== 'visible' || estado.ancho !== ancho) throw new Error(`la pestaña no está al frente o el ancho no es el pedido: ${JSON.stringify(estado)}`)
  const placa = await medir<string>(p, `(() => { const c = document.createElement('canvas').getContext('webgl'); const i = c && c.getExtension('WEBGL_debug_renderer_info'); return i ? String(c.getParameter(i.UNMASKED_RENDERER_WEBGL)) : 'desconocida' })()`)
  return {
    p,
    ancho,
    alto,
    placa,
    cerrar: async () => {
      await cerrarPagina(p)
      await cerrarChrome(chrome)
    },
  }
}

/** La rueda por CDP en un punto (pasa por Lenis como la de una persona): `muescas` de 100 px, una cada `cadaMs`. */
export async function rueda(b: Banco, muescas: number, cadaMs: number, x = b.ancho / 2, y = b.alto / 2): Promise<void> {
  for (let k = 0; k < Math.abs(muescas); k += 1) {
    const t0 = Date.now()
    await b.p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mouseWheel', x: Math.round(x), y: Math.round(y), deltaX: 0, deltaY: Math.sign(muescas) * 100, button: 'none', buttons: 0, modifiers: 0 }, b.p.sessionId)
    const resto = cadaMs - (Date.now() - t0)
    if (resto > 0) await esperar(resto)
  }
}

/** El mouse, de un punto a otro en `pasos` movimientos (uno cada `cadaMs`). */
export async function raton(b: Banco, desde: readonly [number, number], hasta: readonly [number, number], pasos = 1, cadaMs = 16): Promise<void> {
  for (let k = 1; k <= pasos; k += 1) {
    const f = k / pasos
    const x = desde[0] + (hasta[0] - desde[0]) * f
    const y = desde[1] + (hasta[1] - desde[1]) * f
    await b.p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mouseMoved', x: Math.round(x), y: Math.round(y), button: 'none', buttons: 0, modifiers: 0, pointerType: 'mouse' }, b.p.sessionId)
    if (cadaMs > 0) await esperar(cadaMs)
  }
}

/** Una tecla real (Tab, Shift+Tab, Enter, Escape…). */
export async function tecla(b: Banco, clave: 'Tab' | 'Enter' | 'Escape' | ' ', conShift = false): Promise<void> {
  const codigos: Record<string, number> = { Tab: 9, Enter: 13, Escape: 27, ' ': 32 }
  const base = { key: clave, code: clave === ' ' ? 'Space' : clave, windowsVirtualKeyCode: codigos[clave], modifiers: conShift ? 8 : 0 }
  await b.p.conexion.enviar('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...base }, b.p.sessionId)
  if (clave === ' ' || clave === 'Enter') await b.p.conexion.enviar('Input.dispatchKeyEvent', { type: 'char', text: clave === ' ' ? ' ' : '\r', ...base }, b.p.sessionId)
  await b.p.conexion.enviar('Input.dispatchKeyEvent', { type: 'keyUp', ...base }, b.p.sessionId)
}

export interface CuadroGrabado {
  readonly archivo: string
  /** El instante del cuadro en la pantalla, en ms desde la época. */
  readonly t: number
}

/** Graba lo que se ve mientras corre `gesto`: un JPEG por cuadro con su instante. */
export async function grabar(b: Banco, dir: string, gesto: () => Promise<void>, ancho = 1200): Promise<CuadroGrabado[]> {
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  const cuadros: CuadroGrabado[] = []
  let grabando = true
  b.p.conexion.al('Page.screencastFrame', (params) => {
    if (!grabando) return
    const archivo = `c${String(cuadros.length).padStart(5, '0')}.jpg`
    writeFileSync(`${dir}/${archivo}`, Buffer.from(params.data as string, 'base64'))
    const meta = params.metadata as { readonly timestamp?: number } | undefined
    cuadros.push({ archivo, t: (meta?.timestamp ?? Date.now() / 1000) * 1000 })
    void b.p.conexion.enviar('Page.screencastFrameAck', { sessionId: params.sessionId as number }, b.p.sessionId)
  })
  await b.p.conexion.enviar('Page.startScreencast', { format: 'jpeg', quality: 82, maxWidth: ancho, maxHeight: Math.round((ancho * b.alto) / b.ancho), everyNthFrame: 1 }, b.p.sessionId)
  await gesto()
  await b.p.conexion.enviar('Page.stopScreencast', {}, b.p.sessionId)
  grabando = false
  return cuadros
}

/**
 * El video con el tiempo real de cada cuadro (un tirón se ve como un tirón), `lento` veces más lento, con un rótulo
 * arriba a la izquierda. Borra los cuadros sueltos al terminar.
 */
export function armarClip(dir: string, cuadros: readonly CuadroGrabado[], destino: string, rotulo: string, lento = 1): void {
  if (cuadros.length < 2) throw new Error(`el screencast no entregó cuadros (${dir})`)
  const L = ['ffconcat version 1.0']
  for (let i = 0; i < cuadros.length; i += 1) {
    L.push(`file '${cuadros[i].archivo}'`)
    const d = i + 1 < cuadros.length ? (cuadros[i + 1].t - cuadros[i].t) / 1000 : 0.5
    L.push(`duration ${Math.max(0.001, d * lento).toFixed(4)}`)
  }
  L.push(`file '${cuadros[cuadros.length - 1].archivo}'`)
  writeFileSync(`${dir}/lista.ffconcat`, L.join('\n'))
  const texto = rotulo.replace(/:/g, '\\:').replace(/'/g, '')
  const filtro = `fps=60,scale=trunc(iw/2)*2:trunc(ih/2)*2,drawtext=fontfile='C\\:/Windows/Fonts/arial.ttf':text='${texto}':x=12:y=10:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=5`
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', 'lista.ffconcat', '-vf', filtro, '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', destino], { cwd: dir })
  rmSync(dir, { recursive: true, force: true })
}

/** Dos clips lado a lado (el más corto se estira con su último cuadro). */
export function ladoALado(izquierda: string, derecha: string, destino: string, alto = 720): void {
  const duracion = (a: string): number => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', a], { encoding: 'utf8' }).trim())
  const d = Math.max(duracion(izquierda), duracion(derecha))
  const cadena = (i: number): string => `[${String(i)}:v]scale=-2:${String(alto)},fps=60,tpad=stop_mode=clone:stop_duration=60[v${String(i)}]`
  const filtro = `${cadena(0)};${cadena(1)};[v0][v1]hstack=inputs=2:shortest=0[s];[s]trim=duration=${d.toFixed(2)}[f]`
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', izquierda, '-i', derecha, '-filter_complex', filtro, '-map', '[f]', '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', destino])
}

/** Lo que vio el vigía. */
export interface LoQueVioElVigia {
  readonly cambios: readonly { readonly t: number; readonly valor: number; readonly y: number; readonly quien: readonly string[] }[]
  readonly fuentes: readonly number[]
  readonly rehechos: number
  readonly rehechosALaVista: number
  readonly partidos: number
}

export const vigia = (b: Banco): Promise<LoQueVioElVigia> => medir<LoQueVioElVigia>(b.p, 'window.__vigia')

/** Corre una tarea de banco y sale con su código (un corte se dice, no se traga). */
export function correr(tarea: () => Promise<void>): void {
  tarea().then(
    () => process.exit(0),
    (e: unknown) => {
      console.error(`SE CORTO: ${e instanceof Error ? (e.stack ?? e.message) : String(e)}`)
      process.exit(1)
    },
  )
}

/** Un clip `factor` veces más lento (para mirar lo que dura medio segundo). */
export function enCamaraLenta(origen: string, destino: string, factor = 4): void {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', origen, '-vf', `setpts=${String(factor)}*PTS,fps=60`, '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', destino])
}
