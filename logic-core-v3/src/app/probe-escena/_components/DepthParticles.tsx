'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import { FLOOR_Y } from './probeScene'
import {
  PARTICLES_MAX,
  PARTICLE_FAR_COLOR,
  PARTICLE_NEAR_COLOR,
  PARTICLE_R_MAX,
  PARTICLE_R_MIN,
  PARTICLE_SEED,
  PARTICLE_SIZE,
  PARTICLE_SPRITE_SIZE,
  createDotSpriteData,
  createRandom,
} from './probeParticles'
import type { ProbeParamsStore } from './probeStore'

/**
 * Partículas distribuidas en el VOLUMEN de la escena.
 *
 * La diferencia con la grilla de puntos del home viejo (`DotMatrix`) es la que
 * pide el sprint: aquella es una malla plana detrás del logo, así que al mover
 * la cámara todos sus puntos se desplazan juntos y se lee como un fondo pegado.
 * Acá cada partícula está a una distancia distinta, entonces la cámara al
 * orbitar genera paralaje ENTRE ellas — las cercanas barren rápido, las lejanas
 * casi no se mueven. Es lo que convierte el fondo en un espacio.
 *
 * Condición para que eso ocurra: tiene que haber partículas más cerca Y más
 * lejos que la cámara. Por eso el volumen (radio 5 a 34) cubre de adentro de la
 * órbita hasta bastante más allá de la posición más lejana que el slider
 * permite (30).
 */

type DepthParticlesProps = {
  store: ProbeParamsStore
}

export function DepthParticles({ store }: DepthParticlesProps) {
  const geometryRef = useRef<THREE.BufferGeometry>(null)

  /**
   * El campo se calcula UNA vez, con PRNG sembrado (ver `createRandom`): mismo
   * campo en cada carga, así dos capturas del mismo ángulo son comparables.
   *
   * Distribución uniforme en RADIO, no en volumen. Uniforme en volumen (que
   * sería lo "correcto") pone el 96% de las partículas más lejos que el logo,
   * porque el volumen crece con r³ — el campo queda vacío justo donde el
   * paralaje se ve. El exponente 1.4 carga un poco más cerca todavía.
   */
  const field = useMemo(() => {
    const random = createRandom(PARTICLE_SEED)
    const positions = new Float32Array(PARTICLES_MAX * 3)
    const colors = new Float32Array(PARTICLES_MAX * 3)

    const near = new THREE.Color(PARTICLE_NEAR_COLOR)
    const far = new THREE.Color(PARTICLE_FAR_COLOR)
    const tint = new THREE.Color()
    const span = PARTICLE_R_MAX - PARTICLE_R_MIN
    const floorLimit = FLOOR_Y + 0.4

    for (let i = 0; i < PARTICLES_MAX; i += 1) {
      let radius = PARTICLE_R_MIN
      let x = 0
      let y = 0
      let z = 0

      // Media esfera: nada debajo del papel. Rechazo con tope de intentos —
      // arriba del piso está más de la mitad del volumen, así que converge en
      // uno o dos; el tope solo existe para que el bucle no pueda colgarse.
      for (let attempt = 0; attempt < 12; attempt += 1) {
        radius = PARTICLE_R_MIN + span * Math.pow(random(), 1.4)
        const theta = random() * Math.PI * 2
        const cosPhi = 2 * random() - 1
        const sinPhi = Math.sqrt(Math.max(0, 1 - cosPhi * cosPhi))
        x = radius * sinPhi * Math.cos(theta)
        y = radius * cosPhi
        z = radius * sinPhi * Math.sin(theta)
        if (y > floorLimit) break
      }

      positions[i * 3] = x
      positions[i * 3 + 1] = Math.max(y, floorLimit)
      positions[i * 3 + 2] = z

      // Perspectiva atmosférica sobre papel: lo lejano se acerca al fondo.
      tint.copy(near).lerp(far, (radius - PARTICLE_R_MIN) / span)
      colors[i * 3] = tint.r
      colors[i * 3 + 1] = tint.g
      colors[i * 3 + 2] = tint.b
    }

    return { positions, colors }
  }, [])

  /**
   * La forma de la partícula. Sin textura, `PointsMaterial` dibuja cuadrados, y
   * de cerca se leen como artefactos de render en vez de motas (verificado en
   * captura). Es blanca con alfa en degradé: el color lo sigue poniendo el
   * atributo de vértice.
   */
  const sprite = useMemo(() => {
    const texture = new THREE.DataTexture(
      createDotSpriteData(PARTICLE_SPRITE_SIZE),
      PARTICLE_SPRITE_SIZE,
      PARTICLE_SPRITE_SIZE,
      THREE.RGBAFormat
    )
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.needsUpdate = true
    return texture
  }, [])

  useEffect(() => () => sprite.dispose(), [sprite])

  /**
   * La cantidad se mueve con `setDrawRange` sobre el buffer completo, que ya
   * está reservado: cambiar el slider no reasigna memoria ni recalcula
   * posiciones, solo dibuja menos vértices. Y como el campo se generó en orden
   * aleatorio, recortar no saca "las de atrás": ralea parejo.
   *
   * Se suscribe en vez de leer por frame — el store avisa cuando algo cambia y
   * la comparación descarta todo lo que no sea esta perilla.
   */
  useEffect(() => {
    const apply = (values: { particleCount: number }) => {
      const geometry = geometryRef.current
      if (!geometry) return
      const count = Math.round(values.particleCount)
      if (geometry.drawRange.count === count) return
      geometry.setDrawRange(0, count)
    }

    apply(store.current)
    return store.subscribe(apply)
  }, [store])

  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute attach="attributes-position" args={[field.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[field.colors, 3]} />
      </bufferGeometry>
      {/*
        `sizeAttenuation` es lo que hace legible la profundidad: la misma
        partícula se ve grande cerca y minúscula lejos. Sin eso serían todas del
        mismo tamaño y el volumen se leería como ruido plano.

        `depthWrite={false}` para que no se tapen entre ellas de forma dura;
        `depthTest` sigue activo, así que el logo SÍ las tapa.
      */}
      <pointsMaterial
        map={sprite}
        size={PARTICLE_SIZE}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </points>
  )
}
