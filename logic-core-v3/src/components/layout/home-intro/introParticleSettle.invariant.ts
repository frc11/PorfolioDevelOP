import { PARTICLES_MAX } from '@/app/v3/_lib/escena/probeParticles'

import { check, report, section } from './introChecks'
import { SCENE_DUST_SHARE } from './introParticles'
import { readSource } from './introParticleProbe'

/**
 * COMPROBACIÓN ESTÁTICA — que `SCENE_DUST_SHARE` se derive de la fuente real
 * (`probeStore.ts`) y no de un literal copiado. El resto del archivo (destino,
 * asignación, deriva, especie de llegada) era composición y se desarmó (Modo
 * pulido).
 */

// ── 5 · El número copiado, leído de su fuente ──────────────────────────────

section('5 · `SCENE_DUST_SHARE` es el de la escena, leído de `probeStore.ts`')

const store = readSource('src/app/v3/_lib/escena/probeStore.ts')
const declarado = /particleCount:\s*(\d+)\s*,/.exec(store)
check(
  'el reparto de la escena sale de su default y no de un literal inventado',
  declarado !== null && Number(declarado[1]) / PARTICLES_MAX === SCENE_DUST_SHARE,
  `probeStore.ts declara particleCount ${declarado?.[1]} de ${PARTICLES_MAX} = ${SCENE_DUST_SHARE}`
)
check(
  'control positivo — el detector lee el archivo de verdad y encuentra el número',
  store.length > 1000 && declarado !== null,
  `${store.length} bytes leídos`
)

report('introParticleSettle')
