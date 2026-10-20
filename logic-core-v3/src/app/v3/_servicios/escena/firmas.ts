/**
 * [SERVICIOS V0] LAS FIRMAS DE LA RANURA, COMO LAS PROPONE B12a — tipos y una constante: sin JSX y sin valores de three ni de react.
 * Plan: `docs/servicios/SPRINT-V0.md` §1.
 *
 * Son las de `docs/rediseno/SPRINT-B12a.md` §3.1 (el preset de la página) y §3.4 (la ranura de variantes), de `d51d95fc`, escritas
 * IGUALES a la propuesta porque el home todavía no las exporta. Cada una lleva «B12a-API: reemplazar por el import»: cuando salgan
 * `docs/rediseno/B12a-API.md` y el merge de B12a, se borran de acá y se importan de `esc/ruta/`. Lo que el home ya exporta se importa,
 * solo como tipo: `NivelDeCalidad` (`_lib/escena/calidad.ts:57`), `ChoreoKeyframe` (`_lib/escena/choreographyTypes.ts:108`) e
 * `IdDeServicio` (`_secciones/_contrato/acento.ts:57`).
 */

import type { ComponentType } from 'react'
import type * as THREE from 'three'

import type { NivelDeCalidad } from '../../_lib/escena/calidad'
import type { ChoreoKeyframe } from '../../_lib/escena/choreographyTypes'
import type { IdDeServicio } from '../../_secciones/_contrato/acento'

/** B12a-API: reemplazar por el import (`esc/ruta/preset.ts`, SPRINT-B12a §3.1). */
export type IdDePagina = 'home' | IdDeServicio | 'pagina'

/** B12a-API: reemplazar por el import (`esc/ruta/RanuraDeLaVariante.tsx`, SPRINT-B12a §3.4). Lo que la ranura le da a la variante. */
export interface PropsDeLaVariante {
  /** El avance de la intro, 0 → 1. Una referencia que se lee en el useFrame: la variante no re-renderiza por cuadro. */
  readonly avance: Readonly<{ current: number }>
  /** El claro, leído del token una vez por montaje. */
  readonly acento: THREE.Color
  readonly calidad: NivelDeCalidad
  /** Movimiento reducido: el estado final, quieto. */
  readonly reducido: boolean
}

/** B12a-API: reemplazar por el import (`esc/ruta/RanuraDeLaVariante.tsx`, SPRINT-B12a §3.4). */
export type ComponenteDeVariante = ComponentType<PropsDeLaVariante>

/** B12a-API: reemplazar por el import (`esc/ruta/RanuraDeLaVariante.tsx`, SPRINT-B12a §3.4): el criterio de B12a.7. */
export const PRESUPUESTO_DE_LA_VARIANTE = { cpuMsPorCuadro: 0.5 } as const

/** B12a-API: reemplazar por el import (`esc/ruta/preset.ts`, SPRINT-B12a §3.1). Lo declara la página, no una tabla del home (D1). */
export interface PresetDeLaEscena {
  readonly id: IdDePagina
  /** La pista de la intro: de la composición inicial (avance 0) a la pose de la intro (avance 1). El home sigue con CHOREO_KEYFRAMES. */
  readonly pista: 'home' | readonly ChoreoKeyframe[]
  /** Lo que ancla el avance: el bloque de la intro y el del pie (B13). En el home, null: manda el mapeo de las secciones. */
  readonly tramos: { readonly intro: string; readonly pie: string | null } | null
  readonly noche: 'dia' | 'noche'
  /** El servicio dueño del acento: el claro sale del token por el id, nunca un hex. */
  readonly acento: IdDeServicio | null
  readonly variante: ComponenteDeVariante | null
}
