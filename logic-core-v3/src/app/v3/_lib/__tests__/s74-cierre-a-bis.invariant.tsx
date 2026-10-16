/**
 * CIERRE A-bis — CUATRO RETOQUES. Cada cosa con su control positivo (el detector ve el estado de antes o uno roto a propósito).
 *   A4 · la red de noche se forma más rápido (toda en ~7 s, era ~11), con la estabilidad de CIERRE A (el temblor y el titileo, igual).
 */
import { ARBOL, armarElArbol } from '../escena/energia/arbol'
import { azarConSemilla, crearBrasas } from '../escena/energia/brasas'
import { alfaDelDominio, armarElDominio, crearDominio, poblar } from '../escena/energia/dominio'
import { DIBUJO_DE_LA_RED } from '../escena/energia/dibujo/red'
import { REPOSO, crearRed } from '../escena/energia/reposo'
import { FLOOR_Y } from '../escena/probeScene'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

// ═══════════════════════════════════════════════════════════════════════════
titulo('A4 · La red se forma más rápido, igual de estable')

/**
 * La red por defecto (el árbol repartido, `arbol.ts`) armada con la vista de siempre: cuándo nace el último rayo (s desde que se forma).
 * Con `enciendeS`, cuándo están todos enteros; y cuándo, la mitad.
 */
function nacimientos(semilla: number): readonly number[] {
  const az = azarConSemilla(semilla)
  const b = crearBrasas(900, az, FLOOR_Y)
  const d = crearDominio()
  const o = [0, 6.4, 19]
  const largo0 = Math.hypot(o[0], o[1], o[2])
  const f = o.map((x) => -x / largo0)
  const r0 = [-f[2], 0, f[0]]
  const lr = Math.hypot(r0[0], r0[1], r0[2])
  const rr = r0.map((x) => x / lr)
  const uu = [rr[1] * f[2] - rr[2] * f[1], rr[2] * f[0] - rr[0] * f[2], rr[0] * f[1] - rr[1] * f[0]]
  for (let e = 0; e < 3; e += 1) [d.o[e], d.r[e], d.u[e], d.f[e]] = [o[e], rr[e], uu[e], f[e]]
  armarElDominio(d, 35, 1.6, largo0, FLOOR_Y)
  poblar(d, b, az, true)
  for (let i = 0; i < b.n; i += 1) b.vida[i] = alfaDelDominio(d, b.lugar[i * 3], b.lugar[i * 3 + 1], b.lugar[i * 3 + 2])
  const r = crearRed(900)
  r.modo = 'toda'
  armarElArbol(r, b, d, REPOSO.vidaMinima, REPOSO.formaS, az)
  return Array.from(r.nace.subarray(0, r.n)).sort((x, y) => x - y)
}
interface DeLaFormacion {
  readonly enteraS: number
  readonly mitadS: number
  readonly temblor: number
  readonly titileo: number
}
/** Con una escala de los nacimientos (las de antes: `0,7 / enciende` del árbol) y un encendido por rayo. */
const formacion = (nace: readonly number[], escala: number, enciendeS: number): DeLaFormacion => ({
  enteraS: nace[nace.length - 1] * escala + enciendeS,
  mitadS: nace[Math.floor(nace.length / 2)] * escala + enciendeS,
  temblor: DIBUJO_DE_LA_RED.uRed[3],
  titileo: DIBUJO_DE_LA_RED.uRed[2],
})
const NACE = nacimientos(7)
const AHORA = formacion(NACE, 1, REPOSO.enciendeS)
const ANTES = formacion(NACE, 0.7 / ARBOL.enciende, 0.6)
// Más rápida que la de CIERRE A (entre el 55 y el 75 %), con al menos dos segundos de formación; y la estabilidad de CIERRE A A4.
const formacionBien = (x: DeLaFormacion): boolean =>
  NACE.length > 20 && x.enteraS >= 2 && x.enteraS <= 0.75 * 11.1 && x.enteraS >= 0.55 * 11.1 && x.mitadS < x.enteraS && x.temblor <= 0.0024 && x.titileo <= 0.12
afirmar(formacionBien(AHORA), `  ${String(NACE.length)} rayos: la mitad enteros a los ${AHORA.mitadS.toFixed(2)} s y todos a los ${AHORA.enteraS.toFixed(2)} s (antes ${ANTES.mitadS.toFixed(2)} y ${ANTES.enteraS.toFixed(2)}); el temblor ${String(AHORA.temblor)} y el titileo ${String(AHORA.titileo)}, los de CIERRE A`)
controlPositivo('  el detector VE la formación de CIERRE A (~11 s)', ANTES, formacionBien)
controlPositivo('  y una rápida que volvió a temblar (el temblor de antes)', { ...AHORA, temblor: 0.012 }, formacionBien)

cerrar('s74-cierre-a-bis')
