/**
 * INVARIANTE — B8 · EL ARCO DEL SOL: una tarde, una noche en Trabajos, una mañana.
 *
 *     npm run test:s20-arco
 *
 * B8 sacó el velo de B6-A y puso la oscuridad donde puede estar: en la LUZ. El
 * arco (`lightArc.ts`) deja de ser una tarde monótona y cuenta un día con una
 * noche en el medio. Lo que se afirma acá, y por qué:
 *
 *   1. LA FORMA: ocho paradas ordenadas, la elevación DERIVADA del nivel
 *      (nivel = sin(elev)/sin 36°), un solo descenso y un solo ascenso, la mañana
 *      más baja que la tarde, el sol nunca bajo el horizonte, el barrido de S9.
 *   2. DÓNDE: cada parada cae en un nudo del anclaje o de la visibilidad, LEÍDO
 *      de `anclaje.ts`/`visibilidad.ts` y no copiado. Si el anclaje se mueve, el
 *      arco se mueve con él o esto se pone en rojo — y `anclaje.ts` no se tocó.
 *   3. CUÁNTO: la sala se lee oscura en la noche y clara en la mañana, con el
 *      modelo de sombreado que calibró S6–S12 (`probe-escena/__tests__/shading`).
 *   4. EL CONTRALUZ: atado a la sala por debajo de 0,34, continuo en la frontera
 *      y sin mover nada de lo que S6–S12 midieron (nivel ≥ 0,34 intacto).
 *   5. LA SOMBRA: el shadow map alcanza la sombra más larga del arco —la de la
 *      noche—, y con el FAR de S7 no alcanzaba.
 *   6. LA RAMPA del paralaje lee los bordes del atardecer.
 */

import { ANCLAJE, TRAMOS_ANCLADOS } from '../anclaje'
import { AZIMUT_DEL_MOUSE_POR_PROGRESO } from '../choreographyPhysics'
import { sampleLightArc } from '../choreographySampler'
import type { MutableLightLevels } from '../choreographyTypes'
import {
  AMANECER,
  ANCLA_DEL_DIFERENCIAL,
  ATARDECER,
  LIGHT_ARC,
  NIVEL_DE_LA_MANANA,
  NIVEL_DE_LA_NOCHE,
  NOCHE,
  VUELTA,
  elevacionDe,
} from '../lightArc'
import { SHADOW_FAR } from '../probeAtmosphere'
import { CELOSIA_BAR, celosiaSkyFactor } from '../probeCelosia'
import { KEY_DISTANCE, KEY_ELEVATION_DEG, RIM_DIM_SHARE, RIM_INTENSITY, RIM_NIGHT_LEVEL, rimIntensityAt } from '../probeLighting'
import { FLOOR_Y, PAPER_COLOR } from '../probeScene'
import { progresoDePantalla } from '../recorrido'
import { MARGEN_DE_REANUDACION } from '../visibilidad'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import type { Vec3 } from '@/app/probe-escena/__tests__/harness'
import { shadeSurface } from '@/app/probe-escena/__tests__/shading'

const RAD = Math.PI / 180
const arco: MutableLightLevels = { level: 1, kelvin: 6500, azimuthDeg: 0, elevationDeg: 0 }
const en = (p: number): MutableLightLevels => {
  sampleLightArc(p, arco)
  return { ...arco }
}
const muestras = (desde: number, hasta: number, n = 64): number[] =>
  Array.from({ length: n + 1 }, (_, i) => desde + ((hasta - desde) * i) / n)
const monotona = (xs: readonly number[], sentido: 'baja' | 'sube'): boolean =>
  xs.every((v, i) => i === 0 || (sentido === 'baja' ? v <= xs[i - 1] : v >= xs[i - 1]))

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · LA FORMA — ocho paradas, la elevación derivada, un descenso y un ascenso')

afirmarIgual(LIGHT_ARC.length, 9, 'NUEVE paradas: mediodía, fin del hero, dos del atardecer, fin de la noche, fin de la VUELTA (B12), fin del amanecer, el ancla y el final')
afirmar(
  LIGHT_ARC.every((s, i) => i === 0 || s.at > LIGHT_ARC[i - 1].at) && LIGHT_ARC[0].at === 0 && LIGHT_ARC[LIGHT_ARC.length - 1].at === 1,
  'ordenadas por progreso, de 0 a 1',
)
afirmar(
  LIGHT_ARC.every((s) => Math.abs(s.elevationDeg - elevacionDe(s.level)) < 1e-3),
  'la elevación de cada parada SALE del nivel: nivel = sin(elev)/sin(36°), la misma cuenta de S7',
  LIGHT_ARC.map((s) => `${s.level}→${s.elevationDeg}°`).join(' · '),
)
afirmarIgual(elevacionDe(1), KEY_ELEVATION_DEG, 'a nivel 1 la elevación es EXACTAMENTE la que S6 calibró para la key')
controlPositivo('la derivación no devuelve la elevación de S6 para cualquier nivel', 0.5, (n: number) => elevacionDe(n) === KEY_ELEVATION_DEG)

const niveles = LIGHT_ARC.map((s) => s.level)
const unDescensoYUnAscenso = (xs: readonly number[]): boolean => {
  const m = Math.min(...xs)
  const a = xs.indexOf(m)
  const b = xs.lastIndexOf(m)
  return monotona(xs.slice(0, a + 1), 'baja') && monotona(xs.slice(b), 'sube') && xs.slice(a, b + 1).every((v) => v === m)
}
afirmar(
  unDescensoYUnAscenso(niveles),
  'el nivel baja UNA vez, sostiene la noche y sube UNA vez: un día con una noche en el medio, no un péndulo',
  niveles.join(' → '),
)
controlPositivo('el detector ve un arco con DOS noches', [1, 0.1, 0.6, 0.1, 0.6], unDescensoYUnAscenso)
afirmar(
  niveles[niveles.length - 1] < niveles[0] && niveles[niveles.length - 1] === NIVEL_DE_LA_MANANA && Math.min(...niveles) === NIVEL_DE_LA_NOCHE,
  'la mañana es más baja que la tarde, y los dos niveles son los declarados: 0,643 (el del ancla de S9) y 0,08 (la noche)',
  `tarde ${niveles[0]} · noche ${NIVEL_DE_LA_NOCHE} · mañana ${NIVEL_DE_LA_MANANA}`,
)
afirmar(
  LIGHT_ARC.every((s) => s.elevationDeg > 0),
  'el sol nunca baja del horizonte: la noche es un sol rasante, no un sol bajo tierra',
  `mínimo ${Math.min(...LIGHT_ARC.map((s) => s.elevationDeg))}°`,
)
const azimuts = LIGHT_ARC.map((s) => s.azimuthDeg)
afirmar(
  monotona(azimuts, 'sube') && azimuts[azimuts.length - 1] - azimuts[0] === 180,
  'el azimut barre 180° en un solo sentido: un día, de un horizonte al otro (S7/S9)',
  `${azimuts[0]}° → ${azimuts[azimuts.length - 1]}°`,
)
afirmar(
  Math.abs(en(0.375).azimuthDeg - (-42 + (0.25 / 0.375) * 157)) < 1e-3 && Math.abs(en(0.125).azimuthDeg + 42) < 1e-6 && Math.abs(en(0.5).azimuthDeg - 115) < 1e-6,
  'y la recta de S9 (−42° → 115° entre 0,125 y 0,5) no se movió: el azimut de Quiénes somos y Números es el de siempre',
  `en 0,125: ${en(0.125).azimuthDeg.toFixed(4)}° · en 0,375: ${en(0.375).azimuthDeg.toFixed(5)}° contra ${(-42 + (0.25 / 0.375) * 157).toFixed(5)}° de la recta (la parada intermedia, 101,9167°, está redondeada a cuatro decimales) · en 0,5: ${en(0.5).azimuthDeg.toFixed(4)}°`,
)
afirmar(
  monotona(LIGHT_ARC.map((s) => s.kelvin), 'sube'),
  'el kelvin sube monótono: la luz se enfría hacia el final, como en S9',
  LIGHT_ARC.map((s) => s.kelvin).join(' → '),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · DÓNDE — cada parada cae en un nudo del anclaje o de la visibilidad, leído y no copiado')

const geometria = (id: string) => {
  const g = ANCLAJE.geometria.find((f) => f.id === id)
  if (g === undefined) throw new Error(`el anclaje no tiene a "${id}"`)
  return g
}
const trabajos = geometria('trabajos')
const diferencial = geometria('por-que-develop')
afirmarIgual(ATARDECER.desde, progresoDePantalla(trabajos.desdePantalla - 1), 'el atardecer empieza cuando Trabajos toca el pie del cuadro: una pantalla antes de llenarlo')
afirmarIgual(ATARDECER.hasta, progresoDePantalla(trabajos.desdePantalla), '  y termina cuando Trabajos llena el cuadro — una pantalla de scroll, la de la costura')
afirmarIgual(NOCHE.desde, ATARDECER.hasta, 'la noche empieza donde termina el atardecer')
/**
 * ⚠️ **B12 · LA NOCHE DURA EL PIN, Y EL PIN NO ES LA SECCIÓN ENTERA.**
 *
 * Decía que la noche dura hasta `hastaPantalla`, o sea las tres pantallas de la
 * sección. **Un `sticky` de una pantalla adentro de una sección de tres se clava
 * entre la primera y la ANTEÚLTIMA**: en la última el panel se va hacia arriba y
 * Servicios —papel opaco— sube desde el pie del cuadro. Esa pantalla es la
 * «previa al blanco» que pidió el humano, y se la lleva la VUELTA.
 *
 * O sea: la afirmación no se afloja, se **corrige** —la noche dura el pin de
 * verdad, que es una pantalla menos— y la que falta se afirma abajo como lo que
 * es. Las dos siguen leyendo el anclaje, no un literal.
 */
const ultimaPantallaDelPin = trabajos.hastaPantalla - 1
afirmarIgual(NOCHE.hasta, progresoDePantalla(ultimaPantallaDelPin), '  y dura EXACTAMENTE el pin de Trabajos —de la primera pantalla a la anteúltima—: la meseta de B4-A, a oscuras')
afirmarIgual(VUELTA.desde, NOCHE.hasta, 'la VUELTA empieza donde termina la noche (B12)')
afirmarIgual(VUELTA.hasta, progresoDePantalla(trabajos.hastaPantalla), '  y se lleva la ÚLTIMA pantalla de la sección: la única en la que Trabajos se va y Servicios llega — «una previa al blanco»')
afirmarIgual(en(VUELTA.hasta).level, RIM_NIGHT_LEVEL, '  y llega al borde declarado de la noche, no a un número elegido: `RIM_NIGHT_LEVEL`')
afirmar(
  monotona(muestras(VUELTA.desde, VUELTA.hasta).map((p) => en(p).level), 'sube'),
  '  y sube sin volver atrás en toda la pantalla',
  `${en(VUELTA.desde).level} → ${en(VUELTA.hasta).level}`,
)
afirmarIgual(AMANECER.desde, VUELTA.hasta, 'el amanecer empieza donde termina la vuelta')
const reanudacion = progresoDePantalla(diferencial.desdePantalla - 1 - MARGEN_DE_REANUDACION)
afirmar(
  AMANECER.hasta <= reanudacion && reanudacion - AMANECER.hasta < 1e-4,
  '  y termina donde la escena vuelve a dibujar, o un pelo antes: el margen de reanudación antes de que el diferencial asome — amanece escondido',
  `${AMANECER.hasta} contra ${reanudacion.toFixed(6)} (la pantalla ${diferencial.desdePantalla - 1 - MARGEN_DE_REANUDACION}): la parada está redondeada a cuatro decimales, ${(reanudacion - AMANECER.hasta).toExponential(1)} antes de que la escena reanude`,
)
afirmarIgual(
  ANCLA_DEL_DIFERENCIAL,
  TRAMOS_ANCLADOS.find((t) => t.ancla !== undefined)?.ancla,
  'la mañana llega a su nivel en el ancla del diferencial, leída de `anclaje.ts`',
)
afirmarIgual(
  LIGHT_ARC.map((s) => s.at),
  [0, progresoDePantalla(1), ATARDECER.desde, ATARDECER.hasta, NOCHE.hasta, VUELTA.hasta, AMANECER.hasta, ANCLA_DEL_DIFERENCIAL, 1],
  'y las NUEVE paradas son exactamente esos nudos: el arco no inventa un progreso propio',
)
afirmar(
  muestras(0, ATARDECER.desde).every((p) => en(p).level === 1),
  'la meseta de luz: nivel 1 desde el primer píxel hasta que empieza el atardecer — lo que S6–S12 calibraron no se movió',
)
afirmar(
  muestras(NOCHE.desde, NOCHE.hasta).every((p) => Math.abs(en(p).level - NIVEL_DE_LA_NOCHE) < 1e-9),
  'la noche sostiene su nivel durante todo el pin de Trabajos',
)
afirmar(
  muestras(ANCLA_DEL_DIFERENCIAL, 1).every((p) => Math.abs(en(p).level - NIVEL_DE_LA_MANANA) < 1e-9),
  'y la mañana sostiene el suyo desde el ancla hasta el final: la sala no vuelve a bajar detrás del pie',
)
afirmar(
  monotona(muestras(ATARDECER.desde, ATARDECER.hasta).map((p) => en(p).level), 'baja') &&
    monotona(muestras(AMANECER.desde, ANCLA_DEL_DIFERENCIAL).map((p) => en(p).level), 'sube'),
  'baja monótono en el atardecer y sube monótono del amanecer al ancla: sin un parpadeo en el medio',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · CUÁNTO — la sala se lee oscura en la noche y clara en la mañana, con el modelo de S6–S12')

const SKY = celosiaSkyFactor(CELOSIA_BAR)
const ARRIBA: Vec3 = [0, 1, 0]
const piso = (progress: number, cameraAzimuthDeg: number, cameraHeight: number): number =>
  shadeSurface(PAPER_COLOR, ARRIBA, { progress, cameraAzimuthDeg, cameraHeight }, 0, 1, SKY)
const alSol = piso(0, 0, 6.4)
const enLaNoche = piso((NOCHE.desde + NOCHE.hasta) / 2, 195, 4.5)
const enLaManana = piso(1, 360, -1.4)
console.log(`  el papel del piso a plena key: ${alSol.toFixed(1)} a mediodía · ${enLaNoche.toFixed(1)} en la noche · ${enLaManana.toFixed(1)} en la mañana (sobre 255)`)
afirmar(
  enLaNoche < 48,
  'en la noche el papel del piso, a plena key, baja de 48 sobre 255: la sala se lee oscura, sin velo',
  `${enLaNoche.toFixed(1)} — un velo al 0,8 sobre este mismo papel daba gris (B6-A)`,
)
afirmar(
  enLaManana > 120 && enLaManana < alSol,
  'y en la mañana vuelve a leerse claro, sin llegar al mediodía',
  `${enLaManana.toFixed(1)} contra ${alSol.toFixed(1)} a pleno sol`,
)
controlPositivo('el modelo no da oscuro para cualquier pose: a mediodía el piso pasa de 200', 0, (p: number) => piso(p, 0, 6.4) < 48)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · EL CONTRALUZ — atado a la sala por debajo de 0,34, sin mover lo que S6–S12 midieron')

const deS6 = (nivel: number): number => RIM_INTENSITY * (1 - (1 - nivel) * RIM_DIM_SHARE)
afirmarIgual(RIM_NIGHT_LEVEL, 0.34, 'la frontera es 0,34: el nivel más bajo que el arco viejo alcanzaba (p=1), así que nada de lo medido queda debajo')
afirmar(
  muestras(RIM_NIGHT_LEVEL, 1).every((n) => rimIntensityAt(n) === deS6(n)),
  'de 0,34 a 1 el contraluz es EXACTAMENTE el de S6: el piso de S6 intacto',
  `en 1: ${rimIntensityAt(1)} · en 0,34: ${rimIntensityAt(RIM_NIGHT_LEVEL).toFixed(4)}`,
)
afirmar(
  Math.abs(rimIntensityAt(RIM_NIGHT_LEVEL - 1e-9) - deS6(RIM_NIGHT_LEVEL)) < 1e-6,
  '  y en la frontera es continuo: no hay un salto de luz al cruzar 0,34',
)
afirmar(
  rimIntensityAt(0) === 0 && rimIntensityAt(NIVEL_DE_LA_NOCHE) < deS6(NIVEL_DE_LA_NOCHE) * 0.4,
  'por debajo se ata a la sala: a nivel 0 se apaga, y en la noche vale menos de la mitad de lo que S6 le habría dado',
  `en la noche ${rimIntensityAt(NIVEL_DE_LA_NOCHE).toFixed(3)} contra ${deS6(NIVEL_DE_LA_NOCHE).toFixed(3)} — un contraluz que no baja con la sala la lava de gris`,
)
afirmar(monotona(muestras(0, 1, 200).map(rimIntensityAt), 'sube'), '  y sube monótono con el nivel en todo el rango')
controlPositivo('el comparador con S6 ve una diferencia de verdad por debajo de la frontera', 0.2, (n: number) => rimIntensityAt(n) === deS6(n))

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · LA SOMBRA — el shadow map alcanza la sombra más larga del arco, que es la de la noche')

const TOPE_DEL_LOGO = 3.584
let peor = { depth: 0, p: 0, reach: 0 }
for (let i = 0; i <= 400; i += 1) {
  const p = i / 400
  const e = en(p).elevationDeg * RAD
  const reach = (TOPE_DEL_LOGO - FLOOR_Y) / Math.tan(e)
  const depth = KEY_DISTANCE + reach * Math.cos(e) - FLOOR_Y * Math.sin(e)
  if (depth > peor.depth) peor = { depth, p, reach }
}
afirmar(
  peor.depth < SHADOW_FAR,
  'la punta de la sombra más larga entra en el shadow map (la misma cuenta que `s7-sol` §3)',
  `en p=${peor.p.toFixed(4)} la sombra mide ${peor.reach.toFixed(1)} y su profundidad es ${peor.depth.toFixed(1)} contra un FAR de ${SHADOW_FAR}`,
)
afirmar(peor.p >= NOCHE.desde && peor.p <= NOCHE.hasta, '  y es la de la noche, no otra')
controlPositivo('con el FAR de S7 (64) la sombra de la noche NO entraba: por eso B8 lo subió, y no por holgura', 64, (far: number) => peor.depth < far)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · LA RAMPA del paralaje lee los bordes del atardecer')

afirmarIgual(
  [AZIMUT_DEL_MOUSE_POR_PROGRESO[1][0], AZIMUT_DEL_MOUSE_POR_PROGRESO[2][0]],
  [ATARDECER.desde, ATARDECER.hasta],
  'los dos nudos de la rampa del mouse son los bordes del atardecer: un evento adentro de otro (`s18-azimut` mide que no se vea fuera)',
)

cerrar('s20-arco.invariant')
