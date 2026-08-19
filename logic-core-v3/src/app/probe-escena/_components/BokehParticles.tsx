'use client'

import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

import {
  BOKEH_COLOR,
  BOKEH_COUNT,
  BOKEH_OPACITY,
  BOKEH_RADIUS_BIAS,
  BOKEH_R_MAX,
  BOKEH_R_MIN,
  BOKEH_SEED,
  BOKEH_SIZE,
  BOKEH_SPRITE_SIZE,
  FLOOR_Y,
  createBokehSpriteData,
  createRandom,
} from './probeScene'

/**
 * La segunda escala de partículas: pocas, grandes y **desenfocadas**.
 *
 * El campo de polvo (`DepthParticles`) llena el volumen con motas chicas y
 * nítidas. Éste hace lo contrario: setenta discos blandos y grandes, repartidos
 * cargando hacia la cámara. **El desenfoque es lo que más profundidad da por
 * menos polígonos** — no hay forma más barata de decirle al ojo "esto está
 * adelante del plano de foco", y una vez que hay algo adelante del foco, todo lo
 * demás pasa a estar atrás.
 *
 * **Fijas al mundo, no pegadas a la cámara.** Pegadas al lente serían una
 * calcomanía que no se mueve; fijas al mundo, las cercanas barren rápido al
 * orbitar y las lejanas casi no se mueven, que es de donde sale el volumen.
 *
 * El §7.8 del reporte del probe anotaba como pendiente que "a distancias cortas
 * alguna partícula pasa a menos de dos unidades de la cámara y se lee como un
 * disco grande". **Acá eso no es un defecto: es el efecto.**
 *
 * Costo: un draw call y 70 puntos de geometría. Lo que sí cuesta es el fill —
 * son sprites grandes con alfa, o sea overdraw, y es el único que esta escena
 * suma. Las dos perillas son `BOKEH_R_MIN` (cuánto se pueden acercar) y
 * `BOKEH_SIZE`.
 */
export function BokehParticles() {
  /**
   * El campo, con PRNG sembrado y semilla PROPIA: compartir la del polvo haría
   * que los dos campos coincidieran partícula a partícula.
   *
   * `BOKEH_RADIUS_BIAS` por debajo de 1 carga el campo hacia adentro. Uniforme
   * en volumen (r³) dejaría casi todas lejos, justo donde el desenfoque no se
   * ve; uniforme en radio ya sesga hacia la cámara, y 0,85 lo sesga un poco más.
   */
  const field = useMemo(() => {
    const random = createRandom(BOKEH_SEED)
    const positions = new Float32Array(BOKEH_COUNT * 3)
    const colors = new Float32Array(BOKEH_COUNT * 3)

    const tint = new THREE.Color(BOKEH_COLOR)
    const span = BOKEH_R_MAX - BOKEH_R_MIN
    const floorLimit = FLOOR_Y + 0.4

    for (let i = 0; i < BOKEH_COUNT; i += 1) {
      let x = 0
      let y = 0
      let z = 0

      // Media esfera: nada debajo del papel. Rechazo con tope de intentos, igual
      // que el campo de polvo — arriba del piso está más de la mitad del
      // volumen, así que converge en uno o dos.
      for (let attempt = 0; attempt < 12; attempt += 1) {
        const radius = BOKEH_R_MIN + span * Math.pow(random(), BOKEH_RADIUS_BIAS)
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

      // ── Preparado para color, sin implementarlo ──────────────────────────
      //
      // Hoy las setenta escriben el MISMO color. El atributo por vértice existe
      // igual, y existe a propósito: teñir por partícula más adelante es
      // escribir estos tres floats y marcar `needsUpdate`, sin tocar geometría,
      // sin cambiar el material y sin un draw call más. Sin el atributo, el
      // mismo cambio pediría rehacer el buffer entero.
      colors[i * 3] = tint.r
      colors[i * 3 + 1] = tint.g
      colors[i * 3 + 2] = tint.b
    }

    return { positions, colors }
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
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[field.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[field.colors, 3]} />
      </bufferGeometry>
      {/*
        `depthWrite={false}` para que no se recorten entre ellas con un borde
        duro; `depthTest` sigue activo, así que el logo y los softboxes SÍ las
        tapan — que es justo lo que las mantiene adentro de la escena en vez de
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
  )
}
