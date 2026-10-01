/**
 * SPRINT ESCENA 10 · CIERRE — EL DESTELLO, CUADRO A CUADRO: destello-clip.ts <tramo> <acontecimiento> [n-ésimo] [ancho]
 *
 * Arma, con las miniaturas que guardó `destello.ts` (128 × 80, el lienzo leído en el mismo cuadro en que se dibujó), la
 * ventana de ±10 cuadros alrededor de un acontecimiento (`compuerta-prende`, `cambio-a-dia`, `cambio-a-noche`, `salto`)
 * del «antes» y del «después», lado a lado (si un lado no lo tiene —en el después del viaje el amanecer ya no corre—,
 * los mismos cuadros desde que empezó a grabar: los viajes se graban enteros, desde el clic): cada cuadro dura 0,25 s y lleva su número, su instante (ms desde el primero
 * de la ventana) y lo que la escena decidió (la noche de la sala, si el amanecer la sostiene, su segundo). Lo que tapan
 * los paneles opacos (Servicios y Tu panel) va pintado de papel, como lo ve una persona. Además, una tira PNG con los
 * mismos cuadros. Va a `escena10/destello/clips/`.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'

import { DIR10 } from './banco'
import { MINI, bandasALaVista, type Cuadro } from './destello-instrumento'

const [TRAMO, EVENTO, ENESIMO, ANCHO] = [process.argv[2] ?? 'final-lenta', process.argv[3] ?? 'compuerta-prende', Number(process.argv[4] ?? 1), process.argv[5] ?? '1440']
const LADO = 10
const ESCALA = 5
const PAPEL = [242, 240, 235] as const

interface Grabado {
  readonly cuadros: Cuadro[]
  readonly eventos: { i: number; que: string }[]
  readonly rangos: { desde: number; hasta: number }[]
}

const grabado = (rotulo: string): Grabado | null => {
  const base = `${DIR10}/destello/${rotulo}-${ANCHO}/${TRAMO}`
  return existsSync(`${base}.json`) ? (JSON.parse(readFileSync(`${base}.json`, 'utf8')) as Grabado) : null
}
const indiceDel = (g: Grabado | null): number | null => g?.eventos.filter((x) => x.que === EVENTO)[ENESIMO - 1]?.i ?? null

/** Los cuadros de la ventana alrededor del cuadro `centro` (índice, píxeles RGB con los paneles pintados) de un rótulo. */
function ventana(rotulo: string, centro: number): { i: number; c: Cuadro; rgb: Buffer }[] | null {
  const g = grabado(rotulo)
  if (g === null) return null
  const crudo = readFileSync(`${DIR10}/destello/${rotulo}-${ANCHO}/${TRAMO}.rgb`)
  const e = { i: centro }
  const tam = MINI.ancho * MINI.alto * 3
  const lugar = (i: number): number | null => {
    let antes = 0
    for (const r of g.rangos) {
      if (i >= r.desde && i < r.hasta) return (antes + i - r.desde) * tam
      antes += r.hasta - r.desde
    }
    return null
  }
  const r: { i: number; c: Cuadro; rgb: Buffer }[] = []
  for (let i = e.i - LADO; i <= e.i + LADO; i += 1) {
    const o = lugar(i)
    if (o === null || g.cuadros[i] === undefined) continue
    const rgb = Buffer.from(crudo.subarray(o, o + tam))
    const vistas = bandasALaVista(g.cuadros[i])
    for (let y = 0; y < MINI.alto; y += 1) {
      if (vistas[Math.floor((y * vistas.length) / MINI.alto)]) continue
      for (let x = 0; x < MINI.ancho; x += 1) PAPEL.forEach((v, k) => (rgb[(y * MINI.ancho + x) * 3 + k] = v))
    }
    r.push({ i, c: g.cuadros[i], rgb })
  }
  return r
}

const ms = (x: number): string => {
  const t = Math.max(0, x)
  const h = (n: number, d = 2): string => String(Math.floor(n)).padStart(d, '0')
  return `${h(t / 3600000)}:${h((t / 60000) % 60)}:${h((t / 1000) % 60)},${h(t % 1000, 3)}`
}

/** Un video de la ventana (4 cuadros por segundo) con su rótulo por cuadro; devuelve la ruta. */
function video(rotulo: string, cuadros: { i: number; c: Cuadro; rgb: Buffer }[], dir: string): string {
  const tmp = `${dir}/tmp-${rotulo}`
  rmSync(tmp, { recursive: true, force: true })
  mkdirSync(tmp, { recursive: true })
  const t0 = cuadros[0].c.t
  let srt = ''
  cuadros.forEach((f, k) => {
    writeFileSync(`${tmp}/f${String(k).padStart(3, '0')}.ppm`, Buffer.concat([Buffer.from(`P6 ${String(MINI.ancho)} ${String(MINI.alto)} 255\n`), f.rgb]))
    const sala = f.c.noche >= 0.5 ? 'NOCHE' : 'DIA'
    srt += `${String(k + 1)}\n${ms(k * 250)} --> ${ms(k * 250 + 249)}\n${rotulo.toUpperCase()} · cuadro ${String(f.i)} · +${(f.c.t - t0).toFixed(0)} ms · sala ${sala} (${f.c.noche.toFixed(2)}) · amanecer ${f.c.activo === 1 ? `s ${f.c.s.toFixed(2)}${f.c.sostiene === 1 ? ' sostiene la noche' : ''}` : 'apagado'}\n\n`
  })
  writeFileSync(`${tmp}/rotulos.srt`, srt)
  const salida = `${dir}/${rotulo}.mp4`
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '4', '-i', `${tmp}/f%03d.ppm`, '-vf', `scale=${String(MINI.ancho * ESCALA)}:${String(MINI.alto * ESCALA)}:flags=neighbor,subtitles=rotulos.srt:force_style='FontSize=11,Alignment=7,MarginV=6'`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', salida], { cwd: tmp })
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${tmp}/f%03d.ppm`, '-vf', `scale=${String(MINI.ancho * 2)}:${String(MINI.alto * 2)}:flags=neighbor,tile=7x3:padding=4:color=white`, '-frames:v', '1', `${dir}/${rotulo}-tira.png`], { cwd: tmp })
  rmSync(tmp, { recursive: true, force: true })
  return salida
}

function principal(): void {
  const dir = `${DIR10}/destello/clips/${TRAMO}-${EVENTO}-${String(ENESIMO)}-${ANCHO}`
  mkdirSync(dir, { recursive: true })
  const [ia, id] = [indiceDel(grabado('antes')), indiceDel(grabado('despues'))]
  const lados = (['antes', 'despues'] as const).map((r) => {
    // Los viajes se graban desde el clic: los mismos cuadros en los dos lados (el acontecimiento del antes).
    const centro = TRAMO.startsWith('viaje-') || r === 'antes' ? (ia ?? id) : (id ?? ia)
    return { r, v: centro === null ? null : ventana(r, centro) }
  })
  const hechos = lados.filter((x) => x.v !== null && x.v.length > 0).map((x) => video(x.r, x.v ?? [], dir))
  if (hechos.length === 2) execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', hechos[0], '-i', hechos[1], '-filter_complex', '[0:v][1:v]hstack=inputs=2:shortest=0[v]', '-map', '[v]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', `${dir}/antes-despues.mp4`])
  console.log(`${dir}: ${lados.map((x) => `${x.r} ${x.v === null ? 'sin ese acontecimiento' : `${String(x.v.length)} cuadros`}`).join(' · ')}`)
}

principal()
