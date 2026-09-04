/**
 * B2 · FASE 0 — QUÉ LE HACE AL ANCLAJE UNA TABLA DE ALTURAS CANDIDATA.
 *
 * Corre `derivarAnclaje` con la tabla de hoy y con una candidata, y compara
 * **lo que la regla del sprint prohíbe mover**: el progreso en el que cada una
 * de las ocho llena el cuadro, los siete nudos, y el ancla declarada del
 * diferencial.
 *
 * ⚠ No importa `anclaje.ts` para derivar: usa `derivarAnclaje` directo, que es
 * puro de sus argumentos. Así la candidata no toca ningún módulo.
 *
 * Corre con `npx tsx scripts-b2/probar-tabla.ts "1,2,1,3,3,2,1,1"`.
 */
import { CHOREO_TRAMOS } from '../src/app/v3/_lib/escena/choreography'
import { TRAMOS_ANCLADOS } from '../src/app/v3/_lib/escena/anclaje'
import { derivarAnclaje } from '../src/app/v3/_lib/escena/anclajeDerivacion'
import { progresoEnNudos } from '../src/app/v3/_lib/escena/recorrido'
import { SECCIONES, type Seccion } from '../src/app/v3/_lib/secciones'

function conAlturas(pantallas: readonly number[]): readonly Seccion[] {
  if (pantallas.length !== SECCIONES.length) throw new Error('la candidata no tiene ocho alturas')
  return SECCIONES.map((s, i) => ({ ...s, alto: `${pantallas[i] * 100}svh` }))
}

const HOY = SECCIONES.map((s) => Number(s.alto.replace('svh', '')) / 100)
const arg = process.argv[2]
const CAND = arg === undefined ? HOY : arg.split(',').map((n) => Number(n.trim()))

const a = derivarAnclaje(SECCIONES, CHOREO_TRAMOS, TRAMOS_ANCLADOS)
const b = derivarAnclaje(conAlturas(CAND), CHOREO_TRAMOS, TRAMOS_ANCLADOS)

const fmt = (n: number): string => n.toFixed(10)

console.log(`HOY        ${HOY.join(' · ')}   → ${a.pantallasDelDocumento} pantallas, ${a.pantallasDeScroll} de scroll`)
console.log(`CANDIDATA  ${CAND.join(' · ')}   → ${b.pantallasDelDocumento} pantallas, ${b.pantallasDeScroll} de scroll`)
console.log('')

console.log('NUDOS')
console.log('  #   pantalla HOY   pantalla CAND   progreso HOY      progreso CAND     ¿se movió el progreso?')
let nudosIguales = true
for (let i = 0; i < a.nudos.length; i += 1) {
  const x = a.nudos[i]
  const y = b.nudos[i]
  const igual = x.progreso === y.progreso
  if (!igual) nudosIguales = false
  console.log(
    `  ${i}   ${x.pantalla.toFixed(6).padStart(12)}   ${y.pantalla.toFixed(6).padStart(13)}   ` +
      `${fmt(x.progreso).padStart(15)}   ${fmt(y.progreso).padStart(15)}   ${igual ? 'no' : '⚠ SÍ'}`,
  )
}

console.log('')
console.log('EL ANCLAJE DE LAS OCHO — el progreso en el que cada sección llena el cuadro')
console.log('  sección              HOY               CANDIDATA          Δ')
let anclasIguales = true
for (let i = 0; i < a.geometria.length; i += 1) {
  const g = a.geometria[i]
  const h = b.geometria[i]
  const pa = progresoEnNudos(a.nudos, g.desdePantalla)
  const pb = progresoEnNudos(b.nudos, h.desdePantalla)
  const d = pb - pa
  if (d !== 0) anclasIguales = false
  console.log(
    `  ${g.id.padEnd(18)} ${fmt(pa).padStart(15)}   ${fmt(pb).padStart(15)}   ${d === 0 ? '0 (al bit)' : d.toExponential(3)}`,
  )
}

console.log('')
console.log(`nudos con el mismo progreso: ${nudosIguales ? 'SÍ, los siete' : '⚠ NO'}`)
console.log(`las ocho llenan el cuadro en el mismo progreso: ${anclasIguales ? 'SÍ, al bit' : '⚠ NO'}`)
const anclaDeclarada = TRAMOS_ANCLADOS.find((t) => t.ancla !== undefined)?.ancla
const idDelAncla = TRAMOS_ANCLADOS.find((t) => t.ancla !== undefined)?.secciones[0] ?? ''
const iAncla = b.geometria.findIndex((g) => g.id === idDelAncla)
console.log(
  `ancla declarada del diferencial (${anclaDeclarada}): la candidata la devuelve en ` +
    `${fmt(progresoEnNudos(b.nudos, b.geometria[iAncla].desdePantalla))}`,
)
