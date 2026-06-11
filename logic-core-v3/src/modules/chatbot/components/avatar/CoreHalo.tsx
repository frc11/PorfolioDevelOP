'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { STATE_CONFIG, type NeuroAvatarState } from './types'
import { clampDelta } from './frameDelta'

// ── Glow fingido — knobs de calibración (tune by eye) ──────────────────────
// Reemplaza al Bloom del EffectComposer (el composer opacaba el alfa del
// canvas → cuadrado oscuro). Dos sprites additive: solo SUMAN luz, así que
// el alfa del fondo queda intacto y sobre fondos claros se desvanecen igual
// que lo hacía el bloom. La opacidad final escala con glowIntensity por estado.
const CORE_HALO_SIZE = 0.9 // diámetro del halo del núcleo (world units)
const CORE_HALO_OPACITY = 0.45 // × glowIntensity (idle 0.45 / speaking ~0.8)
const SHELL_HALO_SIZE = 2.3 // diámetro del halo que envuelve las partículas
const SHELL_HALO_OPACITY = 0.12 // × glowIntensity — tenue, simula el bleed
// ────────────────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

/**
 * Radial gradient accent → transparente, en un canvas 2D chico. El borde de
 * la textura termina en alfa 0, así el quad del sprite no dibuja ningún borde.
 */
function createGlowTexture(color: string): THREE.CanvasTexture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const [r, g, b] = hexToRgb(color)
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(255,255,255,0.9)')
    gradient.addColorStop(0.25, `rgba(${r},${g},${b},0.55)`)
    gradient.addColorStop(0.6, `rgba(${r},${g},${b},0.16)`)
    gradient.addColorStop(1, `rgba(${r},${g},${b},0)`)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
  }
  return new THREE.CanvasTexture(canvas)
}

interface CoreHaloProps {
  accentColor: string
  state: NeuroAvatarState
}

/**
 * Halo additive de dos capas que reemplaza el glow del Bloom sin
 * post-processing: una capa intensa sobre el núcleo (pulsa en fase con
 * CentralCore: sin(t·3)·0.08) y una capa tenue del tamaño del shell de
 * partículas. AdditiveBlending + depthWrite/depthTest off → nunca ocluye
 * ni se ocluye, y no toca el canal alfa del framebuffer.
 */
export function CoreHalo({ accentColor, state }: CoreHaloProps) {
  const coreRef = useRef<THREE.Sprite>(null)
  const coreMatRef = useRef<THREE.SpriteMaterial>(null)
  const shellMatRef = useRef<THREE.SpriteMaterial>(null)
  const time = useRef(0)

  const texture = useMemo(() => createGlowTexture(accentColor), [accentColor])
  // El composer disponía sus render targets; sin composer el recurso GPU
  // creado a mano es esta textura — se libera al desmontar o cambiar de color.
  useEffect(() => () => texture.dispose(), [texture])

  useFrame((_, rawDelta) => {
    const delta = clampDelta(rawDelta)
    time.current += delta
    const config = STATE_CONFIG[state]
    const pulse = 1 + Math.sin(time.current * 3) * 0.08
    if (coreRef.current) {
      coreRef.current.scale.setScalar(CORE_HALO_SIZE * pulse)
    }
    if (coreMatRef.current) {
      coreMatRef.current.opacity = Math.min(1, CORE_HALO_OPACITY * config.glowIntensity * pulse)
    }
    if (shellMatRef.current) {
      shellMatRef.current.opacity = SHELL_HALO_OPACITY * config.glowIntensity
    }
  })

  return (
    <>
      <sprite ref={coreRef} scale={[CORE_HALO_SIZE, CORE_HALO_SIZE, 1]}>
        <spriteMaterial
          ref={coreMatRef}
          map={texture}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest={false}
          transparent
          toneMapped={false}
        />
      </sprite>
      <sprite scale={[SHELL_HALO_SIZE, SHELL_HALO_SIZE, 1]}>
        <spriteMaterial
          ref={shellMatRef}
          map={texture}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest={false}
          transparent
          toneMapped={false}
        />
      </sprite>
    </>
  )
}
