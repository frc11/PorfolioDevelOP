'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { fibonacciSphere } from './fibonacciSphere'
import { STATE_CONFIG, type NeuroAvatarState } from './types'
import { clampDelta } from './frameDelta'

interface ParticleSphereProps {
  count: number
  accentColor: string
  state: NeuroAvatarState
}

/**
 * Renders `count` small spheres distributed on a unit sphere using
 * Fibonacci sphere distribution. Uses InstancedMesh for performance.
 *
 * Particles oscillate in radius and rotate around Y axis at a speed
 * driven by the current state.
 */
export function ParticleSphere({ count, accentColor, state }: ParticleSphereProps) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const points = useMemo(() => fibonacciSphere(count), [count])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const time = useRef(0)

  useFrame((_, rawDelta) => {
    const delta = clampDelta(rawDelta)
    if (!ref.current) return
    const config = STATE_CONFIG[state]
    time.current += delta

    ref.current.rotation.y += config.rotationSpeed
    ref.current.rotation.x = Math.sin(time.current * 0.5) * 0.1

    points.forEach((basePos, i) => {
      const wave = Math.sin(time.current * 2 + i * 0.5)
      const radius =
        config.particleRadiusBase + wave * config.particleRadiusJitter
      const pos = basePos.clone().multiplyScalar(radius)
      dummy.position.copy(pos)
      dummy.scale.setScalar(0.04)
      dummy.updateMatrix()
      ref.current!.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color={accentColor}
        emissive={accentColor}
        emissiveIntensity={1.2}
        toneMapped={false}
      />
    </instancedMesh>
  )
}
