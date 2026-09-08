/**
 * §3 DEL INVARIANTE DE VISIBILIDAD — LA MÁQUINA DE FASES.
 *
 * Sale de `s9-visibilidad.invariant.ts` en B6-A, cuando ese archivo cruzó las
 * 300 líneas al reescribir sus ventanas para tres bandas. El corte es por tema:
 * allá se afirma DÓNDE se ve la escena (la premisa, las ventanas, la banda); acá
 * CÓMO transiciona el lazo entre corriendo, suspendida y reanudando. Nada de
 * esto cambió en B6-A: es la máquina de SITIO-S9, con sus tres controles.
 */

import { afirmar, afirmarIgual, controlPositivo, titulo } from '../../__tests__/afirmar'
import {
  CUADROS_DE_REANUDACION,
  ESTADO_INICIAL,
  fisicaEn,
  frameloopDe,
  siguiente,
  type EstadoDeLaEscena,
  type EventoDeLaEscena,
} from '../visibilidad'
import { CASILLAS, CORRIENDO, ENTRA, PINTADO, SALE, SUSPENDIDA } from './visibilidadMedida'

export function afirmarLaMaquina(): void {
// ── §3 · LA MÁQUINA ─────────────────────────────────────────────────────────

titulo('§3 · las nueve transiciones')

for (const [estado, evento, fase, mismo, nombre] of CASILLAS) {
  const salida = siguiente(estado, evento)
  afirmar(salida.fase === fase, `${nombre.padEnd(46)} → ${fase}`)
  afirmar(
    (salida === estado) === mismo,
    `${nombre.padEnd(46)} → ${mismo ? 'MISMO objeto (===)' : 'objeto nuevo'}`,
  )
}

controlPositivo(
  'la comparación de arriba es por IDENTIDAD y no por forma',
  { fase: 'corriendo', cuadros: 0 } as EstadoDeLaEscena,
  (copia) => copia === ESTADO_INICIAL,
)

titulo('§3.3 · de suspendida NO se puede pasar a corriendo directo')

const TODOS: readonly EventoDeLaEscena[] = [ENTRA, SALE, PINTADO]
const sinAtajo = (paso: (e: EstadoDeLaEscena, v: EventoDeLaEscena) => EstadoDeLaEscena): boolean =>
  TODOS.every((v) => paso(SUSPENDIDA, v).fase !== 'corriendo')
afirmar(sinAtajo(siguiente), 'ningún evento lleva de suspendida a corriendo sin pasar por reanudando')
controlPositivo('un atajo de suspendida a corriendo se detecta', () => CORRIENDO, sinAtajo)

let estado = SUSPENDIDA
let pintados = 0
estado = siguiente(estado, ENTRA)
while (estado.fase !== 'corriendo' && pintados < 10) {
  estado = siguiente(estado, PINTADO)
  pintados += 1
}
afirmarIgual(
  [estado.fase, pintados],
  ['corriendo', CUADROS_DE_REANUDACION],
  'volver cuesta exactamente CUADROS_DE_REANUDACION cuadros pintados (fase, cuadros)',
)

titulo('§3.5 · qué le pide cada fase al canvas')

for (const [fase, lazo, fisica] of [
  ['corriendo', 'always', true],
  ['suspendida', 'never', false],
  ['reanudando', 'always', false],
] as const) {
  const e: EstadoDeLaEscena = { fase, cuadros: 0 }
  afirmarIgual([frameloopDe(e), fisicaEn(e)], [lazo, fisica], `${fase.padEnd(10)} → lazo y física`)
}
controlPositivo(
  'el lazo NO se apaga en reanudando — si se apagara, el cuadro exacto no se pintaría nunca',
  { fase: 'reanudando', cuadros: 0 } as EstadoDeLaEscena,
  (e) => frameloopDe(e) === 'never',
)
controlPositivo(
  'la física NO corre en reanudando — si corriera, volvería el latigazo desde la pose vieja',
  { fase: 'reanudando', cuadros: 0 } as EstadoDeLaEscena,
  fisicaEn,
)
}
