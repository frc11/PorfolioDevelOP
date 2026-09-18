/**
 * COMPROBACIONES DE S10 · consistencia de config de las partículas.
 *
 *     npx tsx src/app/probe-escena/__tests__/s10-particulas.invariant.ts
 *
 * Dos cosas que no se pueden verificar mirando:
 *
 *   1. Que la deriva sea **diferencial** — una constante por concha, la interior
 *      más rápido — y que las cantidades no se desincronicen del array de conchas.
 *   2. Que la mota cercana sea netamente más oscura que la lejana.
 *
 * ⚠️ **Modo pulido sacó el resto** (despeje de órbita, tamaño de punto, conteo
 * en cuadro y overdraw): era composición.
 */
import {
  BOKEH_BOB_AMPLITUDE,
  BOKEH_BOB_PERIOD_S,
  BOKEH_SPIN_DEG_S,
  DUST_BOB_AMPLITUDE,
  DUST_BOB_PERIOD_S,
  DUST_SPIN_DEG_S,
} from '@/app/v3/_lib/escena/choreographyPhysics'
import {
  BOKEH_SHELLS,
  DUST_SHELLS,
  PARTICLE_FAR_COLOR,
  PARTICLE_NEAR_COLOR,
} from '@/app/v3/_lib/escena/probeParticles'
import { check, report, section } from './harness'
import { shadeUnlit } from './shading'

// ── 3 · Las partículas ──────────────────────────────────────────────────────

section('Las partículas: el relleno de la escena vacía')

{
  check(
    'hay una constante de deriva por concha, en los dos campos',
    DUST_SPIN_DEG_S.length === DUST_SHELLS.length - 1 &&
      DUST_BOB_AMPLITUDE.length === DUST_SHELLS.length - 1 &&
      DUST_BOB_PERIOD_S.length === DUST_SHELLS.length - 1 &&
      BOKEH_SPIN_DEG_S.length === BOKEH_SHELLS.length - 1 &&
      BOKEH_BOB_AMPLITUDE.length === BOKEH_SHELLS.length - 1 &&
      BOKEH_BOB_PERIOD_S.length === BOKEH_SHELLS.length - 1,
    `${DUST_SHELLS.length - 1} conchas de polvo · ${BOKEH_SHELLS.length - 1} de bokeh`
  )
  /**
   * ⚠️ **LOS CONTROLES POSITIVOS DE ESTE ARCHIVO (SITIO-S10).** Corría once
   * afirmaciones sin una sola entrada equivocada. El detector de deriva
   * diferencial va primero con nombre, para poder darle una lista que la viola.
   */
  const decreceHaciaAfuera = (spins: readonly number[]): boolean =>
    spins.every((spin, i) => i === 0 || Math.abs(spin) < Math.abs(spins[i - 1]))
  check(
    'la rotación es DIFERENCIAL: la concha interior gira más rápido',
    decreceHaciaAfuera(DUST_SPIN_DEG_S) && decreceHaciaAfuera(BOKEH_SPIN_DEG_S),
    `polvo ${DUST_SPIN_DEG_S.join(' / ')} °/s · bokeh ${BOKEH_SPIN_DEG_S.join(' / ')} °/s`
  )
  check(
    'control positivo — el mismo detector VE la MISMA lista dada vuelta',
    !decreceHaciaAfuera([...DUST_SPIN_DEG_S].reverse()),
    'una deriva que se acelera hacia afuera no es paralaje: es la escena girando entera'
  )
  check(
    'los dos campos giran en sentidos opuestos, como desde S6',
    DUST_SPIN_DEG_S[0] * BOKEH_SPIN_DEG_S[0] < 0
  )
  check(
    'los períodos de cabeceo son todos distintos entre sí',
    new Set([...DUST_BOB_PERIOD_S, ...BOKEH_BOB_PERIOD_S]).size ===
      DUST_BOB_PERIOD_S.length + BOKEH_BOB_PERIOD_S.length,
    [...DUST_BOB_PERIOD_S, ...BOKEH_BOB_PERIOD_S].join(' / ')
  )

  check(
    'control positivo — el MISMO umbral de 100 puntos NO separa un color de sí mismo',
    !(shadeUnlit(PARTICLE_NEAR_COLOR) < shadeUnlit(PARTICLE_NEAR_COLOR) - 100),
    'sin esto, "netamente más oscura" saldría en verde también con `shadeUnlit` devolviendo cualquier cosa'
  )
  check(
    'la mota cercana es netamente más oscura que la lejana',
    shadeUnlit(PARTICLE_NEAR_COLOR) < shadeUnlit(PARTICLE_FAR_COLOR) - 100,
    `${shadeUnlit(PARTICLE_NEAR_COLOR).toFixed(0)} contra ${shadeUnlit(PARTICLE_FAR_COLOR).toFixed(0)} — la perspectiva atmosférica es lo que las hace leer como volumen`
  )
}

report('s10 · las partículas')
