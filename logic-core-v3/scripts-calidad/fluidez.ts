/**
 * SPRINT CALIDAD 1 — la fluidez, base contra final: fluidez.ts <etiqueta: base|final|lado> [ancho alto dpr]
 *
 * El MISMO recorrido de cámara que mide el banco del motor (el documento entero a 900 px/s, manejado desde el primer
 * `requestAnimationFrame` de cada cuadro) CON vsync, que es lo que se ve. El screencast guarda el instante de cada
 * cuadro y el video lo respeta: un tirón se ve como un tirón (`grabar` de ESCENA reparte los cuadros parejos y lo
 * escondería). Encima, de los `requestAnimationFrame` de la página: los cuadros por segundo de cada medio segundo, el
 * peor intervalo y el tramo, y cada tirón de más de 50 ms en rojo.
 *
 * `base` se graba con el código de la escena del commit de B0 (c1c8b6cd, puesto a mano y devuelto después) y `final`
 * con el de ahora, con la calidad adaptativa prendida como en el producto. `lado` arma los lado a lado. Va a
 * `calidad1/final/`.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { esperar } from '../scripts-viajes/banco'
import { carpeta } from './banco'
import { abrirMotor, type BancoDelMotor } from './motor/abrir'
import { tramoEn, tramosDe, type Documento, type Tramo } from './motor/analisis'

const ETIQUETA = process.argv[2] ?? 'final'
const [ANCHO, ALTO, DPR] = [Number(process.argv[3] ?? 1440), Number(process.argv[4] ?? 900), Number(process.argv[5] ?? 1)]
const VELOCIDAD = 900
const TIRON_MS = 50
const VENTANA_S = 0.5
const FUENTE = "C\\:/Windows/Fonts/arial.ttf"

const nombre = (etiqueta: string): string => `recorrido-${String(ANCHO)}${DPR === 1 ? '' : `@${String(DPR)}x`}-${etiqueta}`

const DOCUMENTO = `(() => {
  const topes = {}, altos = {}
  for (const p of document.querySelectorAll('[data-panel]')) { const r = p.getBoundingClientRect(); topes[p.getAttribute('data-panel')] = Math.round(r.top + scrollY); altos[p.getAttribute('data-panel')] = Math.round(r.height) }
  const tu = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect()
  return { topes, altos, pieDeTuPanel: Math.round(tu.bottom + scrollY), vh: innerHeight, fin: document.documentElement.scrollHeight - innerHeight }
})()`

/** Con la adaptativa prendida: el escalón pedido, el aplicado y el dpr de cada cuadro, para ubicar sus cambios. */
const ANOTADOR = `(() => {
  const t = [], e = [], d = []
  let seguir = true
  const paso = (ahora) => {
    const q = window.__calidadDelBanco.estado()
    t.push(ahora); e.push(q.escalon); d.push(q.dpr)
    if (seguir) requestAnimationFrame(paso)
  }
  requestAnimationFrame(paso)
  window.__anotador = { parar() { seguir = false; return { t, e, d } } }
})()`

interface Cuadro {
  readonly archivo: string
  /** El instante del cuadro en la pantalla, en ms desde la época. */
  readonly t: number
}

async function grabarConTiempos(b: BancoDelMotor, dir: string, gesto: () => Promise<void>): Promise<Cuadro[]> {
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  const cuadros: Cuadro[] = []
  let grabando = true
  b.p.conexion.al('Page.screencastFrame', (params) => {
    if (!grabando) return
    const archivo = `c${String(cuadros.length).padStart(5, '0')}.jpg`
    writeFileSync(`${dir}/${archivo}`, Buffer.from(params.data as string, 'base64'))
    const meta = params.metadata as { readonly timestamp?: number } | undefined
    cuadros.push({ archivo, t: (meta?.timestamp ?? Date.now() / 1000) * 1000 })
    void b.p.conexion.enviar('Page.screencastFrameAck', { sessionId: params.sessionId as number }, b.p.sessionId)
  })
  await b.p.conexion.enviar('Page.startScreencast', { format: 'jpeg', quality: 85, maxWidth: b.ancho, maxHeight: b.alto, everyNthFrame: 1 }, b.p.sessionId)
  await gesto()
  await b.p.conexion.enviar('Page.stopScreencast', {}, b.p.sessionId)
  grabando = false
  return cuadros
}

const hora = (s: number): string => {
  const cs = Math.max(0, Math.round(s * 100))
  return `${String(Math.floor(cs / 360000))}:${String(Math.floor(cs / 6000) % 60).padStart(2, '0')}:${String(Math.floor(cs / 100) % 60).padStart(2, '0')}.${String(cs % 100).padStart(2, '0')}`
}

/** Los rótulos del video (ASS): de los cuadros de la página, alineados al primer cuadro del video. */
function subtitulos(raf: readonly number[], y: readonly number[], t0: number, duracion: number, tramos: readonly Tramo[]): { texto: string; tirones: { s: number; ms: number; tramo: string }[] } {
  const fs = ANCHO < 600 ? 17 : 26
  const L = [
    '[Script Info]',
    'ScriptType: v4.00+',
    `PlayResX: ${String(ANCHO)}`,
    `PlayResY: ${String(ALTO)}`,
    '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    `Style: Cifra,Arial,${String(fs)},&H00FFFFFF,&H00FFFFFF,&H50000000,&H50000000,0,0,0,0,100,100,0,0,3,5,0,1,12,12,12,1`,
    `Style: Tiron,Arial,${String(Math.round(fs * 1.3))},&H003C3CFF,&H003C3CFF,&H50000000,&H50000000,1,0,0,0,100,100,0,0,3,6,0,8,12,12,${String(Math.round(ALTO * 0.12))},1`,
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
  ]
  const salto = ANCHO < 600 ? '\\N' : ' · '
  for (let k = 0; k * VENTANA_S < duracion; k += 1) {
    const [a, z] = [t0 + k * VENTANA_S * 1000, t0 + (k + 1) * VENTANA_S * 1000]
    let [n, peor, donde] = [0, 0, -1]
    for (let i = 1; i < raf.length; i += 1) {
      if (raf[i] < a || raf[i] >= z) continue
      n += 1
      peor = Math.max(peor, raf[i] - raf[i - 1])
      donde = y[i]
    }
    if (n === 0) continue
    L.push(`Dialogue: 0,${hora(k * VENTANA_S)},${hora((k + 1) * VENTANA_S)},Cifra,,0,0,0,,${String(Math.round(n / VENTANA_S))} cuadros/s · peor ${peor.toFixed(0)} ms${salto}${tramoEn(tramos, donde)}`)
  }
  const tirones: { s: number; ms: number; tramo: string }[] = []
  for (let i = 1; i < raf.length; i += 1) {
    const ms = raf[i] - raf[i - 1]
    if (ms <= TIRON_MS) continue
    const s = (raf[i] - t0) / 1000
    tirones.push({ s: Math.round(s * 100) / 100, ms: Math.round(ms), tramo: tramoEn(tramos, y[i]) })
    L.push(`Dialogue: 1,${hora(s - ms / 1000)},${hora(s + 1)},Tiron,,0,0,0,,TIRÓN ${ms.toFixed(0)} ms`)
  }
  return { texto: L.join('\n'), tirones }
}

/** El video con los tiempos de cada cuadro (60 cuadros por segundo parejos, repitiendo) y los rótulos. */
function armarVideo(dir: string, cuadros: readonly Cuadro[], ass: string, destino: string): void {
  const L = ['ffconcat version 1.0']
  for (let i = 0; i < cuadros.length; i += 1) {
    L.push(`file '${cuadros[i].archivo}'`)
    L.push(`duration ${Math.max(0.001, i + 1 < cuadros.length ? (cuadros[i + 1].t - cuadros[i].t) / 1000 : 0.5).toFixed(4)}`)
  }
  L.push(`file '${cuadros[cuadros.length - 1].archivo}'`)
  writeFileSync(`${dir}/lista.ffconcat`, L.join('\n'))
  writeFileSync(`${dir}/rotulos.ass`, ass)
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', 'lista.ffconcat', '-vf', 'fps=60,scale=trunc(iw/2)*2:trunc(ih/2)*2,subtitles=rotulos.ass', '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', destino], { cwd: dir })
}

async function grabarElRecorrido(): Promise<void> {
  const dir = carpeta('final')
  const b = await abrirMotor(ANCHO, ALTO, { dpr: DPR, conVsync: true })
  const base = `${dir}/${nombre(ETIQUETA)}`
  try {
    const adaptativa = ETIQUETA === 'final' ? await medir<boolean>(b.p, '(() => { if (!window.__calidadDelBanco) return false; window.__calidadDelBanco.activa(true); return true })()') : false
    const d = await medir<Documento>(b.p, DOCUMENTO)
    const tramos = tramosDe(d)
    await medir(b.p, 'window.scrollTo(0, 0)')
    await esperar(2500)
    const origen = await medir<number>(b.p, 'performance.timeOrigin')
    if (adaptativa) await medir(b.p, ANOTADOR)
    let pagina: { t: number[]; y: number[] } = { t: [], y: [] }
    const cuadros = await grabarConTiempos(b, `${base}.cuadros`, async () => {
      await esperar(1000)
      await medir(b.p, 'window.__cuadrosDelBanco.empezar()')
      await medir(b.p, `window.__cuadrosDelBanco.recorrer(0, ${String(d.fin)}, ${String(VELOCIDAD)})`)
      await esperar(1500)
      pagina = await medir<{ t: number[]; y: number[] }>(b.p, 'window.__cuadrosDelBanco.parar()')
    })
    if (cuadros.length < 2) throw new Error('el screencast no entregó cuadros')
    const t0 = cuadros[0].t
    const raf = pagina.t.map((t) => origen + t)
    const duracion = (cuadros[cuadros.length - 1].t - t0) / 1000 + 0.5
    const { texto, tirones } = subtitulos(raf, pagina.y, t0, duracion, tramos)
    armarVideo(`${base}.cuadros`, cuadros, texto, `${base}.mp4`)
    rmSync(`${base}.cuadros`, { recursive: true, force: true })
    const intervalos = raf.slice(1).map((t, i) => t - raf[i])
    const perdidos = intervalos.filter((ms) => ms > 13.3 * 1.5).length
    const cambios: { s: number; escalon: number; dpr: number }[] = []
    if (adaptativa) {
      const q = await medir<{ t: number[]; e: number[]; d: number[] }>(b.p, 'window.__anotador.parar()')
      for (let i = 1; i < q.t.length; i += 1) if (q.e[i] !== q.e[i - 1] || q.d[i] !== q.d[i - 1]) cambios.push({ s: Math.round((origen + q.t[i] - t0) / 10) / 100, escalon: q.e[i], dpr: Math.round(q.d[i] * 100) / 100 })
    }
    const resumen = { etiqueta: ETIQUETA, ancho: ANCHO, alto: ALTO, dpr: DPR, adaptativa, segundos: Math.round(duracion * 10) / 10, cuadrosDelVideo: cuadros.length, cuadrosDeLaPagina: raf.length, perdidos, peorMs: Math.round(Math.max(...intervalos)), tirones, cambiosDeLaAdaptativa: cambios }
    writeFileSync(`${base}.json`, JSON.stringify(resumen, null, 1))
    console.log(JSON.stringify(resumen))
  } finally {
    await b.cerrar()
  }
}

/** Los dos lado a lado, a 60 cuadros por segundo (los de ESCENA van a 30: esconderían justo lo que se compara). */
function ladoALado(): void {
  const dir = carpeta('final')
  const [izquierda, derecha] = [`${dir}/${nombre('base')}.mp4`, `${dir}/${nombre('final')}.mp4`]
  const alto = 720
  const rotulo = (texto: string): string => `drawtext=fontfile='${FUENTE}':text='${texto}':x=12:y=10:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=5`
  const cadena = (i: number, texto: string): string => `[${String(i)}:v]scale=-2:${String(alto)},fps=60,${rotulo(texto)},tpad=stop_mode=clone:stop_duration=30[v${String(i)}]`
  const duracion = (a: string): number => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', a], { encoding: 'utf8' }).trim())
  const d = Math.max(duracion(izquierda), duracion(derecha))
  const filtro = `${cadena(0, 'BASE · antes de la parte B')};${cadena(1, 'FINAL · despues de CALIDAD 1')};[v0][v1]hstack=inputs=2:shortest=0[s];[s]trim=duration=${d.toFixed(2)}[f]`
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', izquierda, '-i', derecha, '-filter_complex', filtro, '-map', '[f]', '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', `${dir}/${nombre('base-y-final')}.mp4`])
  console.log(`${dir}/${nombre('base-y-final')}.mp4`)
}

if (process.argv[1]?.endsWith('fluidez.ts')) {
  const tarea = ETIQUETA === 'lado' ? Promise.resolve(ladoALado()) : grabarElRecorrido()
  tarea.then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
}
