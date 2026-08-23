'use client'

import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

import { BOKEH_COLOR, FLOOR_Y } from './probeScene'
import {
  BOKEH_COUNT,
  BOKEH_OPACITY,
  BOKEH_RADIUS_BIAS,
  BOKEH_R_MAX,
  BOKEH_R_MIN,
  BOKEH_SEED,
  BOKEH_SHELLS,
  BOKEH_SIZE,
  BOKEH_SPRITE_SIZE,
  buildParticleField,
} from './probeParticles'
import { createBokehSpriteData } from './particleTextures'

/**
 * LA SEGUNDA ESCALA: pocas, grandes y **desenfocadas**.
 *
 * El campo de polvo (`DepthParticles`) llena el volumen con motas chicas y
 * nítidas. Éste hace lo contrario: noventa discos blandos y grandes, todos
 * **por dentro de la órbita de la cámara**. El desenfoque es lo que más
 * profundidad da por menos polígonos — no hay forma más barata de decirle al ojo
 * "esto está adelante del plano de foco", y una vez que hay algo adelante del
 * foco, todo lo demás pasa a estar atrás.
 *
 * **Fijas al mundo, no pegadas a la cámara.** Pegadas al lente serían una
 * calcomanía que no se mueve; fijas al mundo, las cercanas barren rápido al
 * orbitar y las lejanas casi no se mueven, que es de donde sale el volumen.
 *
 * ── Que un disco pase cerca de la lente ES el efecto; que se PEGUE, no ─────
 *
 * El §7.8 del reporte del probe anotaba como pendiente que "a distancias cortas
 * alguna partícula pasa a menos de dos unidades de la cámara y se lee como un
 * disco grande". Eso es deliberado. Lo que **no** lo es —y S10 lo midió— es que
 * el disco supere el recorte de `gl_PointSize` del driver: a partir de ahí deja
 * de escalar con la distancia y se queda clavado del tamaño del recorte.
 *
 * `BOKEH_R_MAX` = 8 pone el campo entero adentro de la órbita, así que la
 * separación mínima es **1,69** y el tamaño máximo que se puede pedir **575 px**
 * contra un recorte de 1.024. El porqué completo está en `probeParticles.ts`.
 *
 * Costo: dos draw calls y 90 puntos de geometría. Lo que sí cuesta es el fill —
 * son sprites grandes con alfa, o sea el overdraw más grande de esta escena
 * (2,0% a 8,5% del cuadro). Las dos perillas son `BOKEH_COUNT` y `BOKEH_SIZE`.
 */

const SHELL_COUNT = BOKEH_SHELLS.length - 1

export function BokehParticles() {
  /**
   * El campo, con PRNG sembrado y semilla PROPIA: compartir la del polvo haría
   * que los dos campos coincidieran partícula a partícula.
   *
   * `BOKEH_RADIUS_BIAS` por debajo de 1 carga el campo hacia adentro. Uniforme en
   * volumen (r³) dejaría casi todas contra el borde exterior, justo donde el
   * desenfoque casi no se ve.
   */
  const shells = useMemo(() => {
    const field = buildParticleField(
      BOKEH_COUNT,
      BOKEH_R_MIN,
      BOKEH_R_MAX,
      BOKEH_RADIUS_BIAS,
      BOKEH_SEED,
      FLOOR_Y + 0.4,
      BOKEH_SHELLS
    )

    // ── Preparado para color, sin implementarlo ──────────────────────────────
    //
    // Hoy las noventa escriben el MISMO color. El atributo por vértice existe
    // igual, y existe a propósito: teñir por partícula más adelante es escribir
    // estos tres floats y marcar `needsUpdate`, sin tocar geometría, sin cambiar
    // el material y sin un draw call más.
    const tint = new THREE.Color(BOKEH_COLOR)
    const colors = new Float32Array(BOKEH_COUNT * 3)
    for (let i = 0; i < BOKEH_COUNT; i += 1) {
      colors[i * 3] = tint.r
      colors[i * 3 + 1] = tint.g
      colors[i * 3 + 2] = tint.b
    }

    return Array.from({ length: SHELL_COUNT }, (_unused, index) => {
      const from = Math.round(BOKEH_SHELLS[index] * BOKEH_COUNT)
      const to = Math.round(BOKEH_SHELLS[index + 1] * BOKEH_COUNT)
      return {
        positions: field.positions.subarray(from * 3, to * 3),
        colors: colors.subarray(from * 3, to * 3),
      }
    })
  }, [])

  /**
   * La forma. Difiere del sprite de polvo en una sola cosa y es la que importa:
   * meseta plana adentro y caída suave en el 55% exterior. Un lente desenfocado
   * reparte la luz de un punto sobre un DISCO, no sobre una campana — con una
   * gaussiana se lee como niebla, con meseta se lee como fuera de foco.
   */
  const sprite = useMemo(() => {
    const texture = new THREE.DataTexture(
      createBokehSpriteData(BOKEH_SPRITE_SIZE),
      BOKEH_SPRITE_SIZE,
      BOKEH_SPRITE_SIZE,
      THREE.RGBAFormat
    )
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.needsUpdate = true
    return texture
  }, [])

  useEffect(() => () => sprite.dispose(), [sprite])

  return (
    <>
      {shells.map((shell, index) => (
        <group key={index}>
          <points frustumCulled={false}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[shell.positions, 3]} />
              <bufferAttribute attach="attributes-color" args={[shell.colors, 3]} />
            </bufferGeometry>
            {/*
              `depthWrite={false}` para que no se recorten entre ellas con un
              borde duro; `depthTest` sigue activo, así que el logo SÍ las tapa —
              que es justo lo que las mantiene adentro de la escena en vez de
              encima de ella.
            */}
            <pointsMaterial
              map={sprite}
              size={BOKEH_SIZE}
              sizeAttenuation
              vertexColors
              transparent
              opacity={BOKEH_OPACITY}
              depthWrite={false}
            />
          </points>
        </group>
      ))}
    </>
  )
}
