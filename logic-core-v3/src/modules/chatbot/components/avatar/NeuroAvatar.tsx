'use client'

import { Canvas } from '@react-three/fiber'
import { motion } from 'motion/react'
import { ParticleSphere } from './ParticleSphere'
import { CentralCore } from './CentralCore'
import { CoreHalo } from './CoreHalo'
import { NEURO_ORB_SCALE, STATE_CONFIG, type NeuroAvatarProps } from './types'
import { CanvasAutoResize } from './CanvasAutoResize'

/**
 * NeuroAvatar — heavy 3D avatar ("Orbe Neural" in the registry).
 *
 * Renders a Fibonacci sphere of glowing particles around a bright core.
 * The 3 canonical states (idle / thinking / speaking) drive rotation
 * speed, radius variation, core scale and glow.
 *
 * SIN post-processing a propósito: el EffectComposer opacaba el alfa del
 * canvas (cuadrado oscuro detrás del orbe) y dos fixes a nivel shader no lo
 * resolvieron en runtime. El glow lo aporta CoreHalo (sprites additive).
 * El <group scale> mete todo el orbe dentro del frustum con margen — ver
 * los knobs NEURO_* en types.ts.
 *
 * Optimized for small sizes (~45-80px). Performant on mobile.
 *
 * `businessInitials` is part of the canonical contract but ignored here
 * (the orb has no text). The Monogram avatar (B7.2) is the consumer.
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
      style={{ width: size, height: size, overflow: 'hidden' }}
      animate={{ opacity: config.opacity }}
      transition={{ duration: 0.6 }}
    >
      <Canvas
        style={{ width: '100%', height: '100%', display: 'block' }}
        camera={{ position: [0, 0, 3], fov: 45 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
        frameloop={frameloop}
      >
        <CanvasAutoResize />
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 3]} intensity={1} />
        <group scale={NEURO_ORB_SCALE}>
          <ParticleSphere count={120} accentColor={accentColor} state={state} />
          <CentralCore accentColor={accentColor} state={state} />
          <CoreHalo accentColor={accentColor} state={state} />
        </group>
      </Canvas>
    </motion.div>
  )
}
