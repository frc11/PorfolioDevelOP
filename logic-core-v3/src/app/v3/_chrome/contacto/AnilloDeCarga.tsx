'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import { SATINADO, crearElEstudio } from '../../_lib/escena/estudio'
import { INK_COLOR, PAPER_COLOR } from '../../_lib/escena/probeScene'

/**
 * [PULIDO 9] H3 · LA CARGA DEL CONTACTO EN 3D — mientras viaja el mensaje, un anillo que gira dentro de la placa, en el material
 * de la escena: el negro satinado con los reflejos de su estudio (`crearElEstudio`) y un filo claro donde la superficie se pone
 * de costado (como el borde de las letras de noche). En su propio lienzo, chico y transparente, sin compositor (la lección
 * del cuadrado oscuro), y montado sólo mientras se ve. Con movimiento reducido, quieto.
 */
export const ANILLO = { radio: 1, tubo: 0.17, vueltaS: 1.8, inclinacion: 0.55, vaiven: 0.18, filo: 2.6 } as const

const FILO_GLSL = /* glsl */ `
	float deCostado = 1.0 - abs( dot( normalize( vNormal ), normalize( vViewPosition ) ) );
	totalEmissiveRadiance += uColorDelFilo * pow( deCostado, ${ANILLO.filo.toFixed(1)} ) * 0.9;
`

function Anillo({ quieto }: { readonly quieto: boolean }): React.JSX.Element {
  const malla = useRef<THREE.Mesh>(null)
  const reloj = useRef(0)
  const gl = useThree((s) => s.gl)
  // El material y los reflejos de su estudio, armados una vez con el renderer de este lienzo.
  const { material, estudio } = useMemo(() => {
    const reflejos = crearElEstudio(gl)
    const m = new THREE.MeshStandardMaterial({ color: INK_COLOR, roughness: SATINADO.roughness, metalness: 0.15, envMap: reflejos.texture, dithering: true })
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uColorDelFilo = { value: new THREE.Color(PAPER_COLOR) }
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uColorDelFilo;').replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\n${FILO_GLSL}`)
    }
    return { material: m, estudio: reflejos }
  }, [gl])
  useEffect(
    () => () => {
      estudio.dispose()
      material.dispose()
    },
    [estudio, material],
  )
  useFrame((_, dt) => {
    const m = malla.current
    if (m === null || quieto) return
    reloj.current += Math.min(dt, 0.1)
    m.rotation.y = (reloj.current * 2 * Math.PI) / ANILLO.vueltaS
    m.rotation.x = ANILLO.inclinacion + ANILLO.vaiven * Math.sin(reloj.current * 1.3)
  })
  return (
    <mesh ref={malla} material={material} rotation={[ANILLO.inclinacion, 0.6, 0]}>
      <torusGeometry args={[ANILLO.radio, ANILLO.tubo, 40, 120]} />
    </mesh>
  )
}

export default function AnilloDeCarga({ quieto }: { readonly quieto: boolean }): React.JSX.Element {
  return (
    <Canvas dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }} camera={{ position: [0, 0, 4.4], fov: 35 }} frameloop={quieto ? 'demand' : 'always'}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[2, 3, 4]} intensity={1.4} />
      <Anillo quieto={quieto} />
    </Canvas>
  )
}
