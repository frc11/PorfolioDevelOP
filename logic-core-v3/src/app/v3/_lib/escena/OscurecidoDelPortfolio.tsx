'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

import { PORTFOLIO_EN_LA_ESCENA, multiplicadorDelOscurecido } from './portfolioEnLaEscena'

/** El último de la lista transparente del cuadro principal: después del cristal y del pase compartido. */
export const ORDEN_DEL_OSCURECIDO = 1e9

/**
 * [B1] EL OSCURECIDO DEL PORTFOLIO — un cuadro a pantalla completa que MULTIPLICA el color del cuadro por `1 − dim · peso`
 * (`portfolioEnLaEscena.ts`, ajuste B: la exposición no llegaba a todas las capas). Mezcla a medida (`dst × src`, el alfa intacto:
 * el lienzo es opaco), sin profundidad, sin tono, dibujado último. Con el peso en 0 no se dibuja. El «?» de «la tuya» va después
 * (`SignoDeLaTuya`, en el efecto de después del render), así que no se oscurece. Afuera de /v3 (el probe) el peso es 0: inerte.
 */
interface Armado {
  readonly malla: THREE.Mesh
  readonly material: THREE.ShaderMaterial
}

function armar(): Armado {
  const material = new THREE.ShaderMaterial({
    uniforms: { uMultiplicador: { value: 1 } },
    vertexShader: 'void main() { gl_Position = vec4( position.xy, 0.0, 1.0 ); }',
    fragmentShader: 'uniform float uMultiplicador; void main() { gl_FragColor = vec4( vec3( uMultiplicador ), 1.0 ); }',
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.ZeroFactor,
    blendDst: THREE.SrcColorFactor,
    blendSrcAlpha: THREE.ZeroFactor,
    blendDstAlpha: THREE.OneFactor,
  })
  const malla = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
  malla.name = 'portfolio: el oscurecido'
  malla.frustumCulled = false
  malla.renderOrder = ORDEN_DEL_OSCURECIDO
  malla.visible = false
  return { malla, material }
}

/** El cuadro: el multiplicador de este momento (con el peso en 0 no se dibuja). */
function aplicar(a: Armado): void {
  const k = multiplicadorDelOscurecido(PORTFOLIO_EN_LA_ESCENA.dim, PORTFOLIO_EN_LA_ESCENA.peso)
  a.malla.visible = k < 0.999
  a.material.uniforms.uMultiplicador.value = k
}

export function OscurecidoDelPortfolio(): React.JSX.Element {
  const armado = useMemo(() => armar(), [])
  useEffect(
    () => () => {
      armado.malla.geometry.dispose()
      armado.material.dispose()
    },
    [armado],
  )
  useFrame(() => aplicar(armado))
  return <primitive object={armado.malla} />
}
