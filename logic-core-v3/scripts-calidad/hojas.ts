/**
 * SPRINT CALIDAD 1 — las hojas antes/después de los cinco momentos: hojas.ts <carpeta> <ancho> [antes] [despues]
 *
 * Con las capturas de `momentos.ts` en `calidad1/<carpeta>/cuadros/`: una fila con los cinco momentos de antes y otra
 * con los de después, rotuladas. Va a `calidad1/<carpeta>/hoja-<ancho>.png`.
 */
import { MOMENTOS, grilla, type Celda } from '../scripts-escena/hojas6'
import { DIRC } from './banco'

const [CARPETA, ANCHO, ANTES, DESPUES] = [process.argv[2] ?? '', process.argv[3] ?? '1440', process.argv[4] ?? 'antes', process.argv[5] ?? 'despues']

export function hoja(carpeta: string, ancho: string, antes = 'antes', despues = 'despues', celda = Number(ancho) < 1024 ? 300 : 480): string {
  const d = `${DIRC}/${carpeta}/cuadros`
  const fila = (rotulo: string): Celda[] => MOMENTOS.map((m) => ({ archivo: `${d}/${m}-${ancho}-${rotulo}.png`, texto: `${m} - ${rotulo}` }))
  const destino = `${DIRC}/${carpeta}/hoja-${ancho}.png`
  grilla([fila(antes), fila(despues)], celda, destino)
  return destino
}

/** Recortes al doble (vecino más cercano) de la misma zona antes y después: para juzgar nitidez. */
export function recortes(carpeta: string, ancho: string, zonas: readonly { readonly momento: string; readonly zona: readonly [number, number, number, number]; readonly nombre: string }[], antes = 'antes', despues = 'despues'): string {
  const d = `${DIRC}/${carpeta}/cuadros`
  const filas: Celda[][] = zonas.map((z) => [
    { archivo: `${d}/${z.momento}-${ancho}-${antes}.png`, texto: `${z.nombre} x2 - ${antes}`, recorte: z.zona },
    { archivo: `${d}/${z.momento}-${ancho}-${despues}.png`, texto: `${z.nombre} x2 - ${despues}`, recorte: z.zona },
  ])
  const destino = `${DIRC}/${carpeta}/recortes-x2-${ancho}.png`
  grilla(filas, zonas[0].zona[2] * 2, destino)
  return destino
}

if (process.argv[1]?.endsWith('hojas.ts')) console.log(hoja(CARPETA, ANCHO, ANTES, DESPUES))
