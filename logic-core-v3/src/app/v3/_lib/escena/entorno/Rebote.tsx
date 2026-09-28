'use client'

import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import type * as THREE from 'three'

import { entornoDeLaEscena } from '../entorno'
import { FLOOR_Y } from '../probeScene'
import { CHARCO_DEL_HAZ_GLSL } from './Haz'
import { HAZ, VIVO } from './vivo'

/**
 * [ESCENA 7] T12 · LA LUZ QUE REBOTA — de noche, el piso iluminado por el haz aclara apenas la cara de abajo
 * del logo. Un parche sobre el material del logo (no se toca `ProbeLogo`, sólo su material): a la radiancia
 * emitida se le suma la luz del charco que tiene debajo, por lo que su cara mira hacia abajo y por lo cerca
 * que está del piso. Sigue la intensidad del haz (el charco de noche ya lleva el encendido, T9). De día el
 * papel ya ilumina todo: no suma.
 */
export const REBOTE = {
  /** Cuánto de la luz del charco vuelve (una fracción, contra la radiancia del charco). */
  cuanto: 0.9,
  /** En cuánto se apaga con la altura sobre el piso (u). */
  cae: 2.6,
} as const

const PARS = /* glsl */ `
uniform float uNoche;
uniform vec3 uHazDia;
uniform vec3 uHazNoche;
uniform float uRebote;
varying vec3 vMundoDelRebote;
${CHARCO_DEL_HAZ_GLSL}
`

const SUMA = /* glsl */ `
	{
		// La cara que mira hacia abajo recibe la luz del charco que tiene debajo, más cuanto más cerca del piso.
		vec3 normalDelMundo = inverseTransformDirection( normal, viewMatrix );
		float abajo = max( 0.0, - normalDelMundo.y );
		float cerca = exp( - max( 0.0, vMundoDelRebote.y - ${FLOOR_Y.toFixed(4)} ) / ${REBOTE.cae.toFixed(2)} );
		totalEmissiveRadiance += charcoDelHaz( vMundoDelRebote.xz ) * uRebote * abajo * cerca;
	}
`

interface PropsDelRebote {
  readonly logoMaterialRef: RefObject<THREE.MeshStandardMaterial | null>
}

export function Rebote(props: PropsDelRebote) {
  const e = entornoDeLaEscena()
  if (!e.rebote || !e.E1) return null
  return <ReboteEnElLogo {...props} />
}

function ReboteEnElLogo({ logoMaterialRef }: PropsDelRebote) {
  const hecho = useRef<THREE.MeshStandardMaterial | null>(null)
  const uRebote = useRef({ value: 0 })

  useFrame(() => {
    const material = logoMaterialRef.current
    if (material !== null && hecho.current !== material) {
      parchear(material, uRebote.current)
      hecho.current = material
    }
    // Sólo de noche: de día el charco es papel sobre papel.
    uRebote.current.value = REBOTE.cuanto * VIVO.uNoche.value
  })

  return null
}

function parchear(material: THREE.MeshStandardMaterial, uRebote: { value: number }): void {
  const previo = material.onBeforeCompile.bind(material)
  const clavePrevia = material.customProgramCacheKey.bind(material)
  material.onBeforeCompile = (shader, renderer) => {
    previo(shader, renderer)
    Object.assign(shader.uniforms, { uNoche: VIVO.uNoche, uHazDia: VIVO.uHazDia, uHazNoche: VIVO.uHazNoche, uRebote })
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vMundoDelRebote;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n\tvMundoDelRebote = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;')
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>\n${PARS}`).replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\n${SUMA}`)
  }
  material.customProgramCacheKey = () => `${clavePrevia()}|rebote-del-haz|${String(HAZ.radioAbajo)}`
  material.needsUpdate = true
}
