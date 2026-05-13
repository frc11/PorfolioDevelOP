'use client'

import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { motion } from 'motion/react'
import { ParticleSphere } from './ParticleSphere'
import { CentralCore } from './CentralCore'
import { STATE_CONFIG, type NeuroAvatarProps } from './types'

/**
 * NeuroAvatar — exclusive 3D avatar for develOP.
 *
 * Renders a Fibonacci sphere of glowing particles around a bright core.
 * 5 states drive rotation speed, radius variation, core scale and glow.
 *
 * Optimized for small sizes (~56px). Performant on mobile.
 */
export function NeuroAvatar({
  state,
  accentColor,
  size = 56,
  frameloop = 'always',
  className,
}: NeuroAvatarProps) {
  const config = STATE_CONFIG[state]

  return (
    <motion.div
      className={className}
      style={{ width: size, height: size }}
      animate={{ opacity: config.opacity }}
      transition={{ duration: 0.6 }}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
        frameloop={frameloop}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 3]} intensity={1} />
        <ParticleSphere count={120} accentColor={accentColor} state={state} />
        <CentralCore accentColor={accentColor} state={state} />
        <EffectComposer>
          <Bloom
            intensity={config.bloomIntensity}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>
      </Canvas>
    </motion.div>
  )
}
