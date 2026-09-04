/**
 * B2 · FASE 0.2 — LA VELOCIDAD DE LA CÁMARA, CUADRO A CUADRO.
 *
 * Instrumento de medición del sprint. Imprime, para una grilla de posiciones de
 * scroll, la velocidad instantánea de la cámara en las dos unidades que el
 * proyecto ya usa (`s13b-soporte.ts`), más la unidad del scroll que la
 * instrucción pide: alturas de cuadro por 100 px.
 *
 * Corre con `npx tsx scripts-b2/velocidad.ts`.
 */
import { CHOREO_KEYFRAMES } from '../src/app/v3/_lib/escena/choreography'
import { ANCLAJE, pantallaDeScroll } from '../src/app/v3/_lib/escena/anclaje'
import { RITMO_POR_SEGMENTO, progresoDePantalla } from '../src/app/v3/_lib/escena/recorrido'
import { makeTrack, speedAt } from '../src/app/probe-escena/__tests__/harness'
import { SECCIONES } from '../src/app/v3/_lib/secciones'

const PISTA = makeTrack(CHOREO_KEYFRAMES)
const VENTANA = 1080
const ARRIBA = 0
const ABAJO = ANCLAJE.pantallasDelDocumento * VENTANA

/** La velocidad en un scroll, en alturas de cuadro por 100 px. */
export function velocidadEnScroll(y: number): { pantalla: number; progreso: number; porProgreso: number; porCien: number } {
  const pantalla = pantallaDeScroll(y, ARRIBA, ABAJO, VENTANA)
  const progreso = progresoDePantalla(pantalla)
  const porProgreso = speedAt(PISTA, progreso)
  // dProgreso/dPantalla en el segmento que contiene esta pantalla.
  const seg = RITMO_POR_SEGMENTO.find((r) => pantalla >= r.desdePantalla && pantalla <= r.hastaPantalla)
  const ritmo = seg === undefined ? 0 : seg.porPantalla
  // 100 px = 100/VENTANA pantallas.
  const porCien = porProgreso * ritmo * (100 / VENTANA)
  return { pantalla, progreso, porProgreso, porCien }
}

const bordes: { id: string; desde: number; hasta: number }[] = []
let acc = 0
for (const s of SECCIONES) {
  const alto = (Number(s.alto.replace('svh', '')) / 100) * VENTANA
  bordes.push({ id: s.id, desde: acc, hasta: acc + alto })
  acc += alto
}

const maxY = ABAJO - VENTANA
console.log(`documento ${ABAJO} px · recorrido ${maxY} px · ventana ${VENTANA} px`)
console.log('')
console.log('  y      pantalla  progreso   /progreso   fh/100px   sección')
for (let y = 0; y <= maxY; y += 100) {
  const v = velocidadEnScroll(y)
  const s = bordes.find((b) => y >= b.desde && y < b.hasta)
  console.log(
    `${String(y).padStart(6)}  ${v.pantalla.toFixed(3).padStart(7)}  ${v.progreso.toFixed(4).padStart(7)}  ` +
      `${v.porProgreso.toFixed(3).padStart(9)}  ${v.porCien.toFixed(4).padStart(9)}   ${s?.id ?? '—'}`,
  )
}
