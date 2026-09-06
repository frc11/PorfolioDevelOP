/**
 * B2 · FASE 0.2 — «EL FONDO SE ADELANTA ANTES DE QUE YO LLEGUE», medido.
 *
 * La queja del humano, puesta en número: ¿en qué scroll la cámara ya recorrió el
 * 90 % del camino hasta la pose que cierra un tramo, contra el scroll en el que
 * el visitante llega al final de ese tramo?
 *
 * El camino se mide como el que ya usa el repo: distancia recorrida por la
 * CÁMARA en unidades de mundo, normalizada por la altura de cuadro a su
 * distancia (`speedAt` integra exactamente eso).
 *
 * Corre con `npx tsx scripts-b2/adelanto.ts`.
 */
import { CHOREO_KEYFRAMES, CHOREO_TRAMOS } from '../src/app/v3/_lib/escena/choreography'
import { ANCLAJE } from '../src/app/v3/_lib/escena/anclaje'
import { RITMO_POR_SEGMENTO, pantallaDeProgreso, progresoDePantalla } from '../src/app/v3/_lib/escena/recorrido'
import { cameraAt, emptyPose, frameHeight, makeTrack } from '../src/app/probe-escena/__tests__/harness'

const PISTA = makeTrack(CHOREO_KEYFRAMES)
const VENTANA = 1080
const PASOS = 20000

/** El techo candidato, en alturas de cuadro por pantalla de scroll. */
const TECHO = Number(process.argv[2] ?? '1')

/** Longitud de arco de la cámara, en alturas de cuadro, acumulada sobre [0, p]. */
function arco(): { p: number[]; s: number[] } {
  const pose = emptyPose()
  const p: number[] = []
  const s: number[] = []
  let acumulado = 0
  let anterior = cameraAt(PISTA, 0, 16 / 9, pose)
  let posAnterior: readonly [number, number, number] = [anterior.position[0], anterior.position[1], anterior.position[2]]
  let dAnterior = anterior.pose.distance
  p.push(0)
  s.push(0)
  for (let i = 1; i <= PASOS; i += 1) {
    const q = i / PASOS
    const c = cameraAt(PISTA, q, 16 / 9, pose)
    const d = Math.hypot(c.position[0] - posAnterior[0], c.position[1] - posAnterior[1], c.position[2] - posAnterior[2])
    // altura de cuadro a la distancia media del paso, con el mismo criterio de `speedAt`
    acumulado += d / frameHeight((dAnterior + c.pose.distance) / 2)
    p.push(q)
    s.push(acumulado)
    posAnterior = [c.position[0], c.position[1], c.position[2]]
    dAnterior = c.pose.distance
  }
  return { p, s }
}

const { p, s } = arco()
const total = s[s.length - 1]
console.log(`recorrido total de la cámara: ${total.toFixed(2)} alturas de cuadro sobre ${ANCLAJE.pantallasDeScroll} pantallas de scroll`)
console.log(`ritmo parejo: ${(total / ANCLAJE.pantallasDeScroll).toFixed(4)} alturas por pantalla · ${((100 * total) / (ANCLAJE.pantallasDeScroll * VENTANA)).toFixed(4)} por 100 px`)
console.log('')

/** El progreso en el que el arco alcanza una fracción del arco de un intervalo. */
function progresoDeFraccion(desde: number, hasta: number, fraccion: number): number {
  const sa = interp(desde)
  const sb = interp(hasta)
  const objetivo = sa + fraccion * (sb - sa)
  let lo = 0
  let hi = s.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (s[mid] < objetivo) lo = mid + 1
    else hi = mid
  }
  return p[lo]
}

function interp(q: number): number {
  const i = Math.min(PASOS, Math.max(0, Math.round(q * PASOS)))
  return s[i]
}

console.log('tramo             cierra en   el visitante llega ahí en   la cámara hizo el 90 % en   adelanto')
for (let i = 0; i < CHOREO_TRAMOS.length; i += 1) {
  const t = CHOREO_TRAMOS[i]
  const yFinal = pantallaDeProgreso(t.to) * VENTANA
  const yInicial = pantallaDeProgreso(t.from) * VENTANA
  const p90 = progresoDeFraccion(t.from, t.to, 0.9)
  const y90 = pantallaDeProgreso(p90) * VENTANA
  const recorrido = yFinal - yInicial
  const adelanto = recorrido > 0 ? (yFinal - y90) / recorrido : 0
  console.log(
    `${t.name.padEnd(16)} p=${t.to.toFixed(4)}   y=${yFinal.toFixed(0).padStart(6)} px` +
      `              y=${y90.toFixed(0).padStart(6)} px` +
      `        ${(100 * adelanto).toFixed(1).padStart(5)} % del tramo, ${(yFinal - y90).toFixed(0).padStart(5)} px antes`,
  )
}

console.log('')
console.log('EL RITMO POR SEGMENTO, en la unidad de la PANTALLA (alturas de cuadro por pantalla de scroll):')
console.log('segmento          pantallas   arco(fh)   fh/pantalla   fh/100px   × el parejo   pantallas que pediría el techo')
const parejo = total / ANCLAJE.pantallasDeScroll
let pedidas = 0
for (const r of RITMO_POR_SEGMENTO) {
  const a = interp(r.desdePantalla === 0 ? 0 : progresoDePantalla(r.desdePantalla))
  const b = interp(progresoDePantalla(r.hastaPantalla))
  const arcoDelTramo = b - a
  const porPantalla = arcoDelTramo / r.pantallas
  const necesarias = arcoDelTramo / TECHO
  pedidas += Math.max(r.pantallas, necesarias)
  console.log(
    `${r.tramo.padEnd(16)} ${r.pantallas.toFixed(3).padStart(9)}  ${arcoDelTramo.toFixed(3).padStart(8)}  ` +
      `${porPantalla.toFixed(4).padStart(11)}  ${((100 * porPantalla) / VENTANA).toFixed(4).padStart(9)}  ` +
      `${(porPantalla / parejo).toFixed(2).padStart(11)}  ${necesarias.toFixed(3).padStart(12)}`,
  )
}
console.log(`  el recorrido pediría ${pedidas.toFixed(2)} pantallas de scroll con el techo en ${TECHO} fh/pantalla (hoy son ${ANCLAJE.pantallasDeScroll})`)

console.log('')
console.log('fracción del recorrido de la cámara ya consumida cuando el visitante llega a cada sección:')
let acum = 0
for (const g of ANCLAJE.geometria) {
  const pr = progresoDePantalla(g.desdePantalla)
  console.log(
    `  ${g.id.padEnd(18)} y=${(g.desdePantalla * VENTANA).toFixed(0).padStart(6)} px  ` +
      `progreso ${pr.toFixed(4)}  arco ${((100 * interp(pr)) / total).toFixed(1).padStart(5)} %  ` +
      `${g.dejaVerLaEscena ? '← la sala SE VE' : ''}`,
  )
  acum += 1
}
