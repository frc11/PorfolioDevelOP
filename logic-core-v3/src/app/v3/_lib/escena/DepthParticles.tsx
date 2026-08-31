'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import { FLOOR_Y } from './probeScene'
import {
  DUST_SHELLS,
  PARTICLES_MAX,
  PARTICLE_FAR_COLOR,
  PARTICLE_NEAR_COLOR,
  PARTICLE_R_MAX,
  PARTICLE_R_MIN,
  PARTICLE_SEED,
  PARTICLE_SIZE,
  PARTICLE_SPRITE_SIZE,
  buildParticleField,
} from './probeParticles'
import { createDotSpriteData } from './particleTextures'
import type { ProbeParamsStore } from './probeStore'

/**
 * EL POLVO — partículas distribuidas en el VOLUMEN de la escena, en tres conchas.
 *
 * La diferencia con la grilla de puntos del home viejo (`DotMatrix`) es la de
 * siempre: aquella es una malla plana detrás del logo, así que al mover la cámara
 * todos sus puntos se desplazan juntos y se lee como un fondo pegado. Acá cada
 * partícula está a una distancia distinta, entonces la cámara al orbitar genera
 * paralaje ENTRE ellas — las cercanas barren rápido, las lejanas casi no se
 * mueven. Es lo que convierte el fondo en un espacio.
 *
 * Condición para que eso ocurra: tiene que haber partículas más cerca Y más lejos
 * que la cámara. Por eso el volumen (radio 5 a 34) cubre de adentro de la órbita
 * hasta más allá de la posición más lejana del recorrido.
 *
 * ── Las tres conchas ───────────────────────────────────────────────────────
 *
 * Un solo campo, un solo par de buffers, **tres geometrías que son vistas
 * (`subarray`) de los mismos arrays**: no hay copia ni memoria de más. Cada
 * concha va en su propio `<group>` y el rig las gira a ritmos distintos (ver
 * `choreographyPhysics.ts`). Es lo que hace que 2.400 motas no se lean como una
 * nube rígida.
 *
 * El componente devuelve los tres grupos **al mismo nivel**, sin envolverlos: el
 * grupo que los contiene lo pone `ProbeStage`, y el rig lo recorre por sus hijos.
 */

type DepthParticlesProps = {
  store: ProbeParamsStore
}

const SHELL_COUNT = DUST_SHELLS.length - 1

/**
 * Lo único que el recorte necesita de una geometría. Se declara estructural y no
 * como `THREE.BufferGeometry` porque el `ref` del JSX de r3f trae la variante
 * genérica con atributos de GL, y forzar el tipo concreto obligaría a un cast.
 */
type DrawRangeTarget = {
  readonly drawRange: { start: number; count: number }
  setDrawRange(start: number, count: number): void
}

export function DepthParticles({ store }: DepthParticlesProps) {
  const geometryRefs = useRef<(DrawRangeTarget | null)[]>([])

  /**
   * El campo se calcula UNA vez, con PRNG sembrado (ver `createRandom`): mismo
   * campo en cada carga, así dos capturas del mismo ángulo son comparables.
   *
   * Distribución uniforme en RADIO, no en volumen. Uniforme en volumen (que sería
   * lo "correcto") pone el 96% de las partículas más lejos que el logo, porque el
   * volumen crece con r³ — el campo queda vacío justo donde el paralaje se ve. El
   * exponente 1.4 carga un poco más cerca todavía.
   */
  const shells = useMemo(() => {
    const field = buildParticleField(
      PARTICLES_MAX,
      PARTICLE_R_MIN,
      PARTICLE_R_MAX,
      1.4,
      PARTICLE_SEED,
      FLOOR_Y + 0.4,
      DUST_SHELLS
    )

    const near = new THREE.Color(PARTICLE_NEAR_COLOR)
    const far = new THREE.Color(PARTICLE_FAR_COLOR)
    const tint = new THREE.Color()
    const span = PARTICLE_R_MAX - PARTICLE_R_MIN
    const colors = new Float32Array(PARTICLES_MAX * 3)
    for (let i = 0; i < PARTICLES_MAX; i += 1) {
      // Perspectiva atmosférica sobre papel: lo lejano se acerca al fondo.
      tint.copy(near).lerp(far, (field.radii[i] - PARTICLE_R_MIN) / span)
      colors[i * 3] = tint.r
      colors[i * 3 + 1] = tint.g
      colors[i * 3 + 2] = tint.b
    }

    return Array.from({ length: SHELL_COUNT }, (_unused, index) => {
      const from = Math.round(DUST_SHELLS[index] * PARTICLES_MAX)
      const to = Math.round(DUST_SHELLS[index + 1] * PARTICLES_MAX)
      return {
        count: to - from,
        positions: field.positions.subarray(from * 3, to * 3),
        colors: colors.subarray(from * 3, to * 3),
      }
    })
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
   * La cantidad se mueve con `setDrawRange` sobre buffers ya reservados: cambiar
   * el slider no reasigna memoria ni recalcula posiciones, solo dibuja menos
   * vértices.
   *
   * **El recorte se aplica por concha y no al campo entero**, y no es un detalle:
   * el campo está ORDENADO POR RADIO para poder partirlo, así que recortar el
   * final se llevaría solo las lejanas. Por concha, y con el barajado interno que
   * `buildParticleField` hace, recortar es un submuestreo uniforme — ralea parejo
   * y mantiene las tres proporciones.
   */
  useEffect(() => {
    const apply = (values: { particleCount: number }) => {
      const share = Math.min(1, Math.max(0, values.particleCount / PARTICLES_MAX))
      for (let index = 0; index < SHELL_COUNT; index += 1) {
        const geometry = geometryRefs.current[index]
        if (!geometry) continue
        const count = Math.round(shells[index].count * share)
        if (geometry.drawRange.count === count) continue
        geometry.setDrawRange(0, count)
      }
    }

    apply(store.current)
    return store.subscribe(apply)
  }, [store, shells])

  return (
    <>
      {shells.map((shell, index) => (
        <group key={index}>
          <points frustumCulled={false}>
            <bufferGeometry
              ref={(instance) => {
                geometryRefs.current[index] = instance
              }}
            >
              <bufferAttribute attach="attributes-position" args={[shell.positions, 3]} />
              <bufferAttribute attach="attributes-color" args={[shell.colors, 3]} />
            </bufferGeometry>
            {/*
              `sizeAttenuation` es lo que hace legible la profundidad: la misma
              partícula se ve grande cerca y minúscula lejos. Sin eso serían todas
              del mismo tamaño y el volumen se leería como ruido plano.

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
        </group>
      ))}
    </>
  )
}
