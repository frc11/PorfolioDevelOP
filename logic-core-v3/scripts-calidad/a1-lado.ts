/** SPRINT CALIDAD 1 — A1: los clips del menú, antes y después lado a lado (`calidad1/a1-menu/`). */
import { readdirSync } from 'node:fs'

import { DIRC, ladoALado } from './banco'

const dir = `${DIRC}/a1-menu/clips`
for (const a of readdirSync(dir).filter((x) => x.endsWith('-antes.mp4'))) {
  const caso = a.replace('-antes.mp4', '')
  const [viaje, ancho] = [caso.replace(/-\d+$/, ''), caso.match(/-(\d+)$/)?.[1] ?? '']
  const alto = Number(ancho) < 1024 ? 812 : 720
  ladoALado(`${dir}/${a}`, `${dir}/${caso}-despues.mp4`, `${DIRC}/a1-menu/${caso}-antes-y-despues.mp4`, [`${viaje.replace(/-a-/, ' a ')} ${ancho} - antes`, 'despues'], alto)
  console.log(caso)
}
