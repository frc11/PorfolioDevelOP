'use client'

import { useFrame, useThree } from '@react-three/fiber'
import type { MotionValue } from 'motion/react'
import { useRef } from 'react'
import * as THREE from 'three'

import { sampleInkShading } from './introShading'
import { INTRO_SHADOW } from './introTimeline'

/**
 * EL PLANO QUE RECIBE LA SOMBRA — lo único que el logo proyecta sobre el mundo.
 *
 * ── Qué sombra es esta, y qué no es ────────────────────────────────────────
 *
 * **No es la sombra de la escena.** La escena tiene un piso de papel bajo una
 * cámara en perspectiva; el canvas del intro es un rig ortográfico en espacio de
 * píxeles, donde un piso horizontal quedaría de canto e invisible. Son dos
 * espacios distintos y no se pueden mezclar sin montar la escena, que está
 * explícitamente fuera de este sprint.
 *
 * Lo que sí se puede hacer —y es lo que hace esto— es una **sombra proyectada
 * sobre un plano detrás del logo, con la dirección real de la principal de la
 * escena** (azimut −42°, elevación 36°). Cae abajo y a la derecha, a ~0,9 y
 * ~0,98 de `INTRO_SHADOW.distancePx`. Le da peso al objeto y es coherente con la
 * luz que lo está iluminando; cuando la escena se monte en el home, esto se
 * reemplaza por la sombra de verdad.
 *
 * ── Aparece con la luz, no antes ───────────────────────────────────────────
 *
 * Su opacidad cuelga de `reveal`, o sea del acomodamiento: mientras el logo se
 * lee como dibujo plano no tiene una sola luz encima y no hay nada que
 * proyectar. `INTRO_SHADOW.opacity` en 0 la apaga entera.
 *
 * ── El plano cubre exactamente el cuadro ───────────────────────────────────
 *
 * Con cámara ortográfica el frustum es el tamaño del canvas en píxeles y no
 * crece con la distancia, así que un plano de `size.width × size.height` a
 * cualquier Z cubre la vista completa. `ShadowMaterial` es transparente donde no
 * hay sombra, así que fuera de ella el plano no existe visualmente.
 */

type IntroShadowPlaneProps = {
  reveal: MotionValue<number>
  /** Si el mesh no tomó el relevo no hay quien proyecte: la sombra tampoco va. */
  meshOpacity: MotionValue<number>
}

export function IntroShadowPlane({ reveal, meshOpacity }: IntroShadowPlaneProps) {
  const material = useRef<THREE.ShadowMaterial>(null)
  const size = useThree((state) => state.size)

  useFrame(() => {
    const target = material.current
    if (!target) return
    const opacity = sampleInkShading(reveal.get()).shadowOpacity * meshOpacity.get()
    target.opacity = opacity
    target.visible = opacity > 0
  })

  if (INTRO_SHADOW.opacity <= 0) return null

  return (
    <mesh receiveShadow position={[0, 0, -INTRO_SHADOW.distancePx]}>
      <planeGeometry args={[size.width, size.height]} />
      <shadowMaterial ref={material} transparent opacity={0} />
    </mesh>
  )
}
