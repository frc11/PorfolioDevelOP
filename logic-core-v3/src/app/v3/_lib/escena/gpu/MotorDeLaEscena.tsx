'use client'

import type { RefObject } from 'react'
import type * as THREE from 'three'

import { CalidadAdaptativa } from './CalidadAdaptativa'
import { PerfilDeLaGpu } from './PerfilDeLaGpu'
import { Precompilar } from './Precompilar'

/**
 * [CALIDAD 1] EL MOTOR DE LA ESCENA — lo que no dibuja nada y cuida cómo se dibuja: el precompilado de los shaders (B1),
 * la calidad adaptativa (B11) y, con banco, el perfil de la GPU (B0). Un solo montaje en `ProbeStage`.
 */
export function MotorDeLaEscena({ logoMaterialRef, dpr }: { readonly logoMaterialRef: RefObject<THREE.MeshStandardMaterial | null>; readonly dpr: [number, number] }) {
  return (
    <>
      <Precompilar logoMaterialRef={logoMaterialRef} />
      <CalidadAdaptativa dpr={dpr} />
      <PerfilDeLaGpu />
    </>
  )
}
