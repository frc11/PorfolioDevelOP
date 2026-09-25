'use client'

import { useFrame, useLoader } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { SVGLoader } from 'three-stdlib'
import * as THREE from 'three'

import { GIRO_DEL_SVG, construirGeometriasDelLogo } from './ProbeLogo'
import { FLOOR_Y, INK_COLOR, PROBE_SVG_SCALE } from './probeScene'

/**
 * EL REFLEJO DEL LOGO — SPRINT ESCENA, variante V2. **[ESCENA]**
 *
 * Una copia del logo espejada bajo el plano del piso (`y' = 2·FLOOR_Y − y`), que copia cuadro a
 * cuadro la pose que el rig le da al logo. No es un espejo: no hay una segunda pasada de render
 * ni una textura. Se pinta en la pasada opaca, DESPUÉS del piso y sin prueba de profundidad, con
 * mezcla MULTIPLICATIVA: donde cae oscurece apenas el papel, y se desvanece con la distancia al
 * piso. De noche el piso ya es oscuro y el reflejo no se ve, que es lo que haría uno de verdad
 * sobre un papel mate.
 */

/** Cuánto oscurece el reflejo en su punto más fuerte, de 0 a 1. */
const FUERZA = 0.14
/** En cuánta distancia bajo el piso se desvanece, en unidades de mundo. */
const DESVANECIDO = 2.6

export function ReflejoDelLogo({ logoRef }: { readonly logoRef: RefObject<THREE.Group | null> }): React.JSX.Element {
  const svgData = useLoader(SVGLoader, '/logodevelOP.svg')
  const geometrias = useMemo(() => construirGeometriasDelLogo(svgData), [svgData])
  const pose = useRef<THREE.Group>(null)

  const material = useMemo(() => {
    const m = new THREE.MeshBasicMaterial({ color: INK_COLOR, side: THREE.DoubleSide, blending: THREE.MultiplyBlending, premultipliedAlpha: true, depthTest: false, depthWrite: false, toneMapped: false, fog: false })
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uReflejoPiso = { value: FLOOR_Y }
      shader.uniforms.uReflejoFuerza = { value: FUERZA }
      shader.uniforms.uReflejoAlto = { value: DESVANECIDO }
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying float vReflejoY;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvReflejoY = ( modelMatrix * vec4( transformed, 1.0 ) ).y;')
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vReflejoY;\nuniform float uReflejoPiso;\nuniform float uReflejoFuerza;\nuniform float uReflejoAlto;')
        .replace(
          '#include <opaque_fragment>',
          'outgoingLight = mix( vec3( 1.0 ), outgoingLight, uReflejoFuerza * ( 1.0 - smoothstep( 0.0, uReflejoAlto, uReflejoPiso - vReflejoY ) ) );\n#include <opaque_fragment>',
        )
    }
    m.customProgramCacheKey = () => 'reflejo-del-logo'
    return m
  }, [])

  useFrame(() => {
    const logo = logoRef.current
    const destino = pose.current
    if (logo === null || destino === null) return
    destino.position.copy(logo.position)
    destino.quaternion.copy(logo.quaternion)
    destino.scale.copy(logo.scale)
  })

  useEffect(() => () => material.dispose(), [material])
  useEffect(() => {
    const construidas = geometrias.built
    return () => construidas.forEach((g) => g.dispose())
  }, [geometrias])

  return (
    <group position={[0, 2 * FLOOR_Y, 0]} scale={[1, -1, 1]}>
      <group ref={pose}>
        <group scale={PROBE_SVG_SCALE} rotation={GIRO_DEL_SVG}>
          {geometrias.built.map((geometria, i) => (
            <mesh key={i} geometry={geometria} material={material} renderOrder={1} />
          ))}
        </group>
      </group>
    </group>
  )
}
