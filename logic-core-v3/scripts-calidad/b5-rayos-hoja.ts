/** SPRINT CALIDAD 1 — B5 · las hojas de los rayos (antes y después, en sus dos segundos) y los recortes al doble. OJO con el nombre: los guardas de línea de comandos del banco miran cómo TERMINA el nombre del script (`hojas.ts`, `comparar.ts`), y este importa esos módulos. */
import { grilla, type Celda } from '../scripts-escena/hojas6'
import { DIRC } from './banco'
import { recortes } from './hojas'

const d = `${DIRC}/b5-rayos/cuadros`
for (const [ancho, celda] of [['1440', 480], ['375', 300], ['1440@1.5x', 480]] as const) {
  const fila = (r: string): Celda[] => ['4.9', '5.8'].map((s) => ({ archivo: `${d}/rayos-${s}-${ancho}-${r}.png`, texto: `rayos ${s} s - ${r}` }))
  grilla([fila('antes'), fila('despues')], celda, `${DIRC}/b5-rayos/hoja-${ancho}.png`)
}
console.log(
  recortes('b5-rayos', '1440', [
    { momento: 'rayos-4.9', zona: [120, 130, 480, 270], nombre: 'trama y cielo 4,9 s' },
    { momento: 'rayos-4.9', zona: [860, 560, 480, 270], nombre: 'piso 4,9 s' },
    { momento: 'rayos-5.8', zona: [480, 240, 480, 270], nombre: 'logo 5,8 s' },
  ]),
)
console.log(
  recortes('b5-rayos', '375', [
    { momento: 'rayos-4.9', zona: [0, 150, 374, 260], nombre: 'trama 4,9 s' },
    { momento: 'rayos-5.8', zona: [0, 450, 374, 260], nombre: 'piso 5,8 s' },
  ]),
)
