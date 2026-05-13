'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { STATE_CONFIG, type NeuroAvatarState } from './types'

interface CentralCoreProps {
  accentColor: string
  state: NeuroAvatarState
}

/**
 * Bright spherical core at the center of the avatar.
 * Pulses subtly based on state.
 */
export function CentralCore({ accentColor, state }: CentralCoreProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const time = useRef(0)

  useFrame((_, delta) => {
    if (!meshRef.current) return
    time.current += delta
    const config = STATE_CONFIG[state]
    const pulse = 1 + Math.sin(time.current * 3) * 0.08
    meshRef.current.scale.setScalar(config.coreScale * pulse)
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive={accentColor}
        emissiveIntensity={STATE_CONFIG[state].coreEmissive}
        toneMapped={false}
      />
    </mesh>
  )
}
