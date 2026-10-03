'use client'

import { Suspense, lazy, type RefObject } from 'react'
import type * as THREE from 'three'

import { CONSULTA_ESCENARIO } from '../compuerta'
import { useAnchoMinimo } from '../useAnchoMinimo'

import { entornoDeLaEscena } from './entorno'
import type { ProbeRigStore, ProbeStatsStore } from './probeStore'

/**
 * LO PEREZOSO DE LA ESCENA — un solo montaje en `ProbeStage` (que no pasa de 300 líneas): lo que viaja en un módulo
 * aparte y se descarga sólo si hace falta. [ESCENA 10] T3: los títulos de volumen, en su módulo (la geometría de la Chivo
 * y su fuente). [3D Y SONIDO] T1: pasaron al producto (`Entorno.titulos`, el negro; `titulos=blanco` para comparar,
 * `titulos=no` los apaga): el módulo sigue perezoso, llega después del primer cuadro. [RETOQUE DEL PIE] P2: el pie de
 * volumen, en el suyo (con los títulos; `?pruebas=pie=antes` lo cambia por el de antes, que es del DOM).
 */
const TitulosDeVolumen = lazy(() => import('./titulos3d/TitulosDeVolumen'))
const PieDeVolumen = lazy(() => import('./pie3d/PieDeVolumen'))

interface Props {
  readonly keyLightRef: RefObject<THREE.DirectionalLight | null>
  readonly logoMaterialRef: RefObject<THREE.MeshStandardMaterial | null>
  readonly stats: ProbeStatsStore
  readonly rig: ProbeRigStore
}

export function PruebasDeLaEscena(props: Props) {
  // Abajo de 1025 las secciones no tienen escenario: ningún título se anota y el módulo no se descarga.
  const escritorio = useAnchoMinimo(CONSULTA_ESCENARIO)
  if (entornoDeLaEscena().titulos === 'no' || !escritorio) return null
  const conElPie = entornoDeLaEscena().pruebas.pie !== 'antes'
  return (
    <>
      <Suspense fallback={null}>
        <TitulosDeVolumen {...props} />
      </Suspense>
      {conElPie && (
        <Suspense fallback={null}>
          <PieDeVolumen keyLightRef={props.keyLightRef} />
        </Suspense>
      )}
    </>
  )
}
