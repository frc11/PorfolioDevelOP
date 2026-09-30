'use client'

import { Suspense, lazy, type RefObject } from 'react'
import type * as THREE from 'three'

import { entornoDeLaEscena } from './entorno'
import type { ProbeRigStore, ProbeStatsStore } from './probeStore'

/**
 * LAS PRUEBAS DE LA ESCENA — un solo montaje en `ProbeStage` (que no pasa de 300 líneas), y cada una sólo con su
 * bandera: sin ninguna, no se monta ni se descarga nada. [ESCENA 10] T3: los títulos de volumen (`titulos=negro|blanco`),
 * en un módulo aparte (la geometría de la Chivo y su fuente viajan sólo con la bandera).
 */
const TitulosDeVolumen = lazy(() => import('./titulos3d/TitulosDeVolumen'))

interface Props {
  readonly keyLightRef: RefObject<THREE.DirectionalLight | null>
  readonly logoMaterialRef: RefObject<THREE.MeshStandardMaterial | null>
  readonly stats: ProbeStatsStore
  readonly rig: ProbeRigStore
}

export function PruebasDeLaEscena(props: Props) {
  if (entornoDeLaEscena().pruebas.titulos === 'no') return null
  return (
    <Suspense fallback={null}>
      <TitulosDeVolumen {...props} />
    </Suspense>
  )
}
