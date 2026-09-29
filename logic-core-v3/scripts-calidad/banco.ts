/**
 * SPRINT CALIDAD 1 — lo que comparten los bancos de este sprint: la carpeta de entregas (una por punto) y
 * cómo se abre la página (la de ESCENA 7: el punto del cursor, el contador de dibujos, el espía de saltos y
 * los errores). Contra el servidor de desarrollo, con un Chrome propio por CDP y el candado de Chrome.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'

export { abrir7 as abrir } from '../scripts-escena/banco7'

const FUENTE = "C\\:/Windows/Fonts/arial.ttf"
const rotulo = (texto: string): string => `drawtext=fontfile='${FUENTE}':text='${texto}':x=12:y=10:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=5`

/**
 * Dos clips lado a lado, cada uno con su rótulo, a la misma altura y a 30 cuadros por segundo; dura lo que el
 * más largo (el más corto se queda en su último cuadro).
 */
export function ladoALado(izquierda: string, derecha: string, destino: string, rotulos: readonly [string, string], alto = 720): void {
  const cadena = (i: number, texto: string): string => `[${String(i)}:v]scale=-2:${String(alto)},fps=30,${rotulo(texto)},tpad=stop_mode=clone:stop_duration=30[v${String(i)}]`
  const filtro = `${cadena(0, rotulos[0])};${cadena(1, rotulos[1])};[v0][v1]hstack=inputs=2:shortest=0[s];[s]trim=duration=__D__[f]`
  const duracion = (a: string): number => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', a], { encoding: 'utf8' }).trim())
  const d = Math.max(duracion(izquierda), duracion(derecha))
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', izquierda, '-i', derecha, '-filter_complex', filtro.replace('__D__', d.toFixed(2)), '-map', '[f]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', destino])
}

/** Las entregas de este sprint. */
export const DIRC = 'C:/Users/Valentino/.cache/b4-medicion/calidad1'

/** La carpeta de un punto (o una subcarpeta), creada si no está. */
export function carpeta(nombre: string): string {
  const dir = `${DIRC}/${nombre}`
  mkdirSync(dir, { recursive: true })
  return dir
}
