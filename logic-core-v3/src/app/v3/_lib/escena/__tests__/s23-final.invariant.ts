/**
 * s23 · EL FINAL DEL RECORRIDO — el corte recto, el logo claro en el primer cuadro, la
 * excepción D al techo de velocidad y la ida y vuelta de A a E. **[FINAL]**
 *
 * Todo sale de los datos reales —la coreografía, el anclaje, el arco y el revelado— y
 * cada afirmación lleva su control positivo: el detector se corre contra la versión de
 * antes (o una fabricada) y tiene que decir que no.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { CHOREO_KEYFRAMES } from '../choreography'
import type { ChoreoKeyframe, MutableLightLevels } from '../choreographyTypes'
import { sampleLightArc } from '../choreographySampler'
import { ANCLAJE } from '../anclaje'
import { POSES_DEL_FINAL, TIEMPOS_DEL_FINAL, progresoDelFinal } from '../finalDelRecorrido'
import { NIVEL_DE_LA_NOCHE } from '../lightArc'
import { EMISION_EN_LA_NOCHE, emisionDelLogoEn } from '../logoEmision'
import { RAMPA_DE_LA_ENTRADA_PX, REVELADO_FRACCION, maskDeRevelado } from '../revelado'
import { RITMO_POR_SEGMENTO, progresoDePantalla } from '../recorrido'
import { MARGEN_DE_REANUDACION } from '../visibilidad'
import { cameraAt, emptyPose, makeTrack, speedAt, type Track } from '@/app/probe-escena/__tests__/harness'

const PISTA = makeTrack(CHOREO_KEYFRAMES)
const MARGEN = 1.5e-3

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El corte recto: entre el panel blanco y la escena no hay degradado')

const corteRecto = (m: string | null, fila: number): boolean => m !== null && m.includes(`transparent ${fila}px`) && m.includes(`#000 ${fila}px`)
const ENTRA = maskDeRevelado([{ row: 600, tipo: 'entra' }], 900, 900 * REVELADO_FRACCION)
afirmar(RAMPA_DE_LA_ENTRADA_PX === 0 && corteRecto(ENTRA, 600), 'la costura donde la sala entra es un borde limpio: oculta hasta la fila, plena desde la misma fila', ENTRA ?? 'null')
controlPositivo('  el chequeo vería la rampa de 0,125 de antes', maskDeRevelado([{ row: 600, tipo: 'sale' }], 900, 900 * REVELADO_FRACCION), (m: string | null) => corteRecto(m, 600))

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El logo ya está claro en el primer cuadro en que se ve la escena')

const geo = ANCLAJE.geometria.find((g) => g.id === 'por-que-develop')
if (geo === undefined) throw new Error('falta por-que-develop en el anclaje')
/** Donde la sección asoma por el pie del cuadro, y donde la escena reanuda (un margen antes). */
const ASOMA = progresoDePantalla(geo.desdePantalla - 1)
const REANUDA = progresoDePantalla(geo.desdePantalla - 1 - MARGEN_DE_REANUDACION)
const nivelEn = (p: number, arco: (p: number, out: MutableLightLevels) => void = sampleLightArc): number => {
  const out = { level: 0, kelvin: 0, azimuthDeg: 0, elevationDeg: 0 } as MutableLightLevels
  arco(p, out)
  return out.level
}
const claroEn = (p: number, arco?: (p: number, out: MutableLightLevels) => void): boolean => nivelEn(p, arco) <= NIVEL_DE_LA_NOCHE + 1e-9 && emisionDelLogoEn(nivelEn(p, arco)) >= EMISION_EN_LA_NOCHE - 1e-9
afirmar(claroEn(REANUDA) && claroEn(ASOMA), `cuando la escena reanuda (p ${REANUDA.toFixed(4)}) y cuando la sección asoma (p ${ASOMA.toFixed(4)}) el arco está en la noche y el logo emite entero`, `nivel ${nivelEn(ASOMA).toFixed(3)} · emisión ${emisionDelLogoEn(nivelEn(ASOMA)).toFixed(3)} de ${String(EMISION_EN_LA_NOCHE)}`)
let quieto = true
for (let p = REANUDA; p <= 1; p += 1e-4) if (!claroEn(p)) quieto = false
afirmar(quieto, '  y lo sigue estando hasta el final: el cambio a claro pasó entero ANTES, mientras Tu Panel tapaba la sala')
// El arco de antes: amanecía escondido y llegaba a la mañana (0,643) en el ancla.
const ARCO_DE_ANTES = (p: number, out: MutableLightLevels): void => {
  out.level = p < 0.7375 ? 0.34 : 0.5 + ((0.643 - 0.5) * Math.min(1, (p - 0.7375) / (0.8525 - 0.7375)))
}
controlPositivo('  el chequeo vería el arco de antes, que amanecía y dejaba el logo gris', ARCO_DE_ANTES, (arco: (p: number, out: MutableLightLevels) => void) => claroEn(ASOMA, arco))

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El techo: el arranque sigue siendo lo más rápido, salvo el alejamiento D')

const RITMO_DEL_CIERRE = RITMO_POR_SEGMENTO[RITMO_POR_SEGMENTO.length - 1].porPantalla
const ritmoEn = (p: number): number => {
  let acumulado = 0
  for (const r of RITMO_POR_SEGMENTO) {
    if (p < acumulado + r.progreso) return r.porPantalla
    acumulado += r.progreso
  }
  return RITMO_DEL_CIERRE
}
/** El pico de velocidad, en alturas de cuadro por PANTALLA de scroll, sobre [desde, hasta]. */
const pico = (pista: Track, desde: number, hasta: number): number => {
  let m = 0
  for (let p = desde + MARGEN; p <= hasta - MARGEN; p += (hasta - desde) / 800) m = Math.max(m, speedAt(pista, p) * ritmoEn(p))
  return m
}
const ARRANQUE = pico(PISTA, 0, 0.125)
const D = { desde: progresoDelFinal(TIEMPOS_DEL_FINAL.cta.hasta), hasta: progresoDelFinal(TIEMPOS_DEL_FINAL.pie.llega) }
const fueraDeD = (pista: Track): number => Math.max(pico(pista, 0.125, D.desde), pico(pista, D.hasta, 1))
const EN_D = pico(PISTA, D.desde, D.hasta)
afirmar(fueraDeD(PISTA) <= ARRANQUE, `fuera de D ningún tramo pasa al arranque: pico ${fueraDeD(PISTA).toFixed(3)} contra ${ARRANQUE.toFixed(3)} alturas de cuadro por pantalla`)
afirmar(EN_D > ARRANQUE, `**la excepción declarada: el alejamiento D va a ${EN_D.toFixed(2)} por pantalla, ${(EN_D / ARRANQUE).toFixed(2)} veces el arranque**`, `D ocupa ${((TIEMPOS_DEL_FINAL.pie.llega - TIEMPOS_DEL_FINAL.cta.hasta)).toFixed(2)} pantallas, de p ${D.desde.toFixed(4)} a ${D.hasta.toFixed(4)}`)
// El control: un final donde los VALORES llegan de golpe tiene que poner esto en rojo.
const conValoresDeGolpe: ChoreoKeyframe[] = CHOREO_KEYFRAMES.map((k) =>
  k.name === 'valores' ? { ...k, at: progresoDelFinal(TIEMPOS_DEL_FINAL.frase.hasta) + 0.002 } : k,
)
controlPositivo('  el detector vería un segundo tramo por encima del techo (los valores de golpe)', makeTrack(conValoresDeGolpe), (pista: Track) => fueraDeD(pista) <= ARRANQUE)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · A → E ida y vuelta, sin saltos en ninguna frontera')

const posicion = (p: number): readonly number[] => cameraAt(PISTA, p, 16 / 9, emptyPose()).position
/**
 * Un SALTO no es velocidad: es lo que la pose cambia entre dos puntos pegados a la
 * frontera. Con ε de 1e−7 de progreso (una centésima de píxel de scroll) una cámara
 * continua se mueve milésimas —D, la más rápida, 6e−4— y una que salta, lo que salta.
 */
const EPSILON = 1e-7
const saltoEn = (p: number, pos: (p: number) => readonly number[] = posicion): number => {
  const a = pos(p - EPSILON)
  const b = pos(p + EPSILON)
  return Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2])
}
const FRONTERAS = [
  ['aparece (asoma)', ASOMA],
  ['A → B', progresoDelFinal(TIEMPOS_DEL_FINAL.frase.hasta)],
  ['B → C', progresoDelFinal(TIEMPOS_DEL_FINAL.valores.hasta)],
  ['C → D', D.desde],
  ['D → E', D.hasta],
] as const
const saltos = FRONTERAS.map(([nombre, p]) => [nombre, saltoEn(p)] as const)
const TOPE_DEL_SALTO = 1e-3
afirmar(saltos.every(([, s]) => s < TOPE_DEL_SALTO), `en cada frontera la pose a los dos lados coincide: menos de ${String(TOPE_DEL_SALTO)} de mundo con ε = 1e−7 de progreso`, saltos.map(([n, s]) => `${n} ${s.toExponential(1)}`).join(' · '))
const ida = [0.8, 0.86, 0.9, 0.93, 0.96, 0.97, 0.99].map((p) => posicion(p).join(','))
const vuelta = [0.99, 0.97, 0.96, 0.93, 0.9, 0.86, 0.8].map((p) => posicion(p).join(',')).reverse()
afirmarIgual(vuelta, ida, '  y subiendo se deshace al revés: la pose es función del scroll, la misma en los dos sentidos')
const conSalto = (p: number): readonly number[] => (p < D.desde ? posicion(p) : [0, 0, 60])
controlPositivo('  el detector de saltos vería una cámara que se teletransporta en C → D', conSalto, (pos: (p: number) => readonly number[]) => saltoEn(D.desde, pos) < TOPE_DEL_SALTO)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Los literales del recorrido son los de `finalDelRecorrido.ts`')

// El bloque de keyframes va en literales porque el editor de la escena lo exporta así, byte por byte.
const T = TIEMPOS_DEL_FINAL
const DERIVADOS: readonly (readonly [string, number, ChoreoKeyframe['pose']])[] = [
  ['frase · sostén', progresoDelFinal(T.frase.hasta), POSES_DEL_FINAL.frase],
  ['valores', progresoDelFinal(T.valores.llega), POSES_DEL_FINAL.valores],
  ['valores · sostén', progresoDelFinal(T.valores.hasta), POSES_DEL_FINAL.valores],
  ['cta', progresoDelFinal(T.cta.llega), POSES_DEL_FINAL.cta],
  ['cta · sostén', progresoDelFinal(T.cta.hasta), POSES_DEL_FINAL.cta],
  ['pie', progresoDelFinal(T.pie.llega), POSES_DEL_FINAL.pie],
  ['pie · sostén', 1, POSES_DEL_FINAL.pie],
]
const mismaPose = (a: ChoreoKeyframe['pose'], b: ChoreoKeyframe['pose']): boolean => (Object.keys(b) as (keyof ChoreoKeyframe['pose'])[]).every((k) => a[k] === b[k])
/** Cada keyframe del final cae donde dice el tiempo (a lo sumo el redondeo del exportador, 5e−5) y con su pose. */
const coinciden = (ks: readonly ChoreoKeyframe[]): boolean =>
  DERIVADOS.every(([nombre, at, pose]) => {
    const k = ks.find((x) => x.name === nombre)
    return k !== undefined && Math.abs(k.at - at) <= 5e-5 && mismaPose(k.pose, pose)
  })
afirmar(coinciden(CHOREO_KEYFRAMES), 'los siete keyframes del final caen en su tiempo (al redondeo del exportador) y con su pose', DERIVADOS.map(([n, at]) => `${n} ${at.toFixed(4)}`).join(' · '))
controlPositivo(
  '  el chequeo vería una pose del final editada a mano sin tocar `finalDelRecorrido.ts`',
  CHOREO_KEYFRAMES.map((k) => (k.name === 'cta' ? { ...k, pose: { ...k.pose, height: 1 } } : k)),
  coinciden,
)

cerrar('s23-final.invariant')
