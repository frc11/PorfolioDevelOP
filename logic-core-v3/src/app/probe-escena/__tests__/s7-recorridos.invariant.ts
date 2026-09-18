/**
 * COMPROBACIONES DE S7 · que las coreografías sean reproducibles.
 *
 *     npx tsx src/app/probe-escena/__tests__/s7-recorridos.invariant.ts
 *
 * Lo que verifica, en una línea: que las coreografías sean reproducibles —
 * `at` estrictamente creciente, arranca en 0 y termina en 1, las poses caben
 * en los rangos de los sliders, `buildTrack` no tira y la vuelta cierra en 360.
 *
 * ⚠️ **Modo pulido sacó el resto**: que ninguna pose calibrada se haya movido,
 * la curvatura de los siete arcos y que la cámara no se meta donde no hay
 * escena eran composición.
 */
import { CHOREO_VARIANTS } from '../_components/choreographyVariants'
import {
  check,
  makeTrack,
  report,
  section,
} from './harness'
// La tabla de referencia de S6, los detectores y sus entradas rotas viven en el
// soporte: acá quedan las afirmaciones. La costura, y su porqué, están allá.
import {
  ROTO,
  atsCrecientes,
  fueraDeRango,
} from './s7-recorridos-soporte'

// ── 1 · Estructura de los cuatro recorridos ─────────────────────────────────

section('Todos los recorridos son reproducibles')

check('control positivo — el detector de `at` crecientes VE uno que no avanza', !atsCrecientes(ROTO))
check(
  'control positivo — y el de rangos VE una pose fuera de los sliders, sin señalar la sana',
  fueraDeRango(ROTO).length === 1 && fueraDeRango(ROTO)[0] === 'rota',
  `señala "${fueraDeRango(ROTO).join(', ')}"`
)

for (const variant of CHOREO_VARIANTS) {
  const { keyframes, label } = variant

  check(`${label}: los \`at\` son estrictamente crecientes`, atsCrecientes(keyframes), `${keyframes.length} keyframes`)
  check(
    `${label}: arranca en 0 y termina en 1`,
    keyframes[0].at === 0 && keyframes[keyframes.length - 1].at === 1
  )

  const offenders = fueraDeRango(keyframes)
  check(
    `${label}: todas las poses caben en los rangos de los sliders`,
    offenders.length === 0,
    offenders.length > 0 ? offenders.join(', ') : 'height, distance y encuadre'
  )

  let built = true
  let unwrappedEnd = 0
  try {
    const track = makeTrack(keyframes)
    unwrappedEnd = track.unwrappedAngles[track.unwrappedAngles.length - 1]
  } catch {
    built = false
  }
  check(`${label}: \`buildTrack\` no tira`, built)
  check(`${label}: la vuelta entera sobrevive`, unwrappedEnd === 360, `ángulo desenvuelto final ${unwrappedEnd}`)
}

report('s7 · recorridos')
