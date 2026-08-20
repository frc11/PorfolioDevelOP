'use client'

import { forwardRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'

import {
  MOIRE_BOTTOM,
  MOIRE_COLOR,
  MOIRE_DOT_COLUMNS,
  MOIRE_DOT_RADIUS,
  MOIRE_DOT_ROWS,
  MOIRE_DOT_TEXTURE,
  MOIRE_OPACITY,
  MOIRE_RADIUS,
  MOIRE_SEGMENTS,
  MOIRE_SLATS,
  MOIRE_SLAT_DUTY,
  MOIRE_SLAT_SLANT,
  MOIRE_SLAT_TEXTURE,
  MOIRE_TOP,
  createDotFieldData,
  createSlatSpriteData,
} from './probeMoire'

/**
 * LA PANTALLA DE RENDIJAS.
 *
 * Un cilindro abierto alrededor de la escena, visto desde adentro, con las dos
 * tramas del moiré en las dos ranuras de textura del mismo material. Los números
 * y el porqué de cada uno están en `probeMoire.ts`; acá está el cableado.
 *
 * **Un draw call, 192 triángulos, una sola superficie transparente.**
 *
 * ── `MeshLambertMaterial`, y es una excepción con motivo ───────────────────
 *
 * La regla de la escena es que todo sea `meshStandardMaterial`, para que la sala
 * entera se apague con el cierre. Ésta es la única pieza que usa Lambert, y la
 * razón es de costo: es la superficie que más área de pantalla cubre con mezcla
 * encendida, así que su shader se paga sobre medio cuadro y encima con blending.
 *
 * Lo que la regla protege se conserva entero: Lambert responde a **las mismas
 * tres luces**, al mismo hemisférico y a la **misma niebla**, así que se apaga
 * con el arco exactamente igual. Lo único que no calcula es el lóbulo especular
 * — que una pantalla mate no tiene.
 *
 * ── `BackSide`, no `DoubleSide` ────────────────────────────────────────────
 *
 * La cámara está siempre adentro del cilindro, así que solo se ven las caras
 * internas. Con `BackSide` three dibuja esas y además **invierte la normal** al
 * sombrear (`FLIP_SIDED`), o sea que la superficie se ilumina como lo que es:
 * una pared mirando hacia adentro, igual que el ciclorama que tiene detrás.
 * `DoubleSide` dibujaría también las caras de afuera, que nadie ve nunca.
 *
 * ── Sin sombra, ni proyectada ni recibida ──────────────────────────────────
 *
 * Como el resto de las familias lejanas: la ortográfica del shadow map cubre
 * solo la esfera del logo, así que esto no entraría al mapa aunque se lo
 * marcara.
 *
 * ── Lo que NO hace ─────────────────────────────────────────────────────────
 *
 * No se mueve solo. El desplazamiento de la trama de rendijas lo escribe el
 * único `useFrame` de la escena sobre la textura que este componente expone por
 * `ref` — misma disciplina que la vira del logo y la deriva de las partículas.
 */

export type MoireHandle = {
  /** La trama que se desplaza. El loop le escribe `offset.x`. */
  readonly slats: THREE.Texture
}

export const MoireScreen = forwardRef<MoireHandle>(function MoireScreen(_props, ref) {
  const height = MOIRE_TOP - MOIRE_BOTTOM

  const textures = useMemo(() => {
    const slats = new THREE.DataTexture(
      createSlatSpriteData(MOIRE_SLAT_TEXTURE, MOIRE_SLAT_DUTY, MOIRE_SLAT_SLANT),
      MOIRE_SLAT_TEXTURE,
      MOIRE_SLAT_TEXTURE,
      THREE.RGBAFormat
    )
    slats.wrapS = THREE.RepeatWrapping
    // La envolvente vertical llega a 0 en los dos bordes, así que la V no
    // repite: `ClampToEdge` evita que un filtrado de borde traiga la fila de
    // arriba sobre la de abajo.
    slats.wrapT = THREE.ClampToEdgeWrapping
    slats.repeat.set(MOIRE_SLATS, 1)
    // Mipmaps + anisotropía: son el seguro contra ventanas chicas y DPR alto.
    // En el caso medido (1920×1080) sobran quince veces, pero no cuestan nada.
    slats.generateMipmaps = true
    slats.minFilter = THREE.LinearMipmapLinearFilter
    slats.magFilter = THREE.LinearFilter
    slats.anisotropy = 4
    slats.needsUpdate = true

    const dots = new THREE.DataTexture(
      createDotFieldData(MOIRE_DOT_TEXTURE, MOIRE_DOT_RADIUS),
      MOIRE_DOT_TEXTURE,
      MOIRE_DOT_TEXTURE,
      THREE.RGBAFormat
    )
    dots.wrapS = THREE.RepeatWrapping
    dots.wrapT = THREE.RepeatWrapping
    dots.repeat.set(MOIRE_DOT_COLUMNS, MOIRE_DOT_ROWS)
    dots.generateMipmaps = true
    dots.minFilter = THREE.LinearMipmapLinearFilter
    dots.magFilter = THREE.LinearFilter
    dots.anisotropy = 4
    dots.colorSpace = THREE.SRGBColorSpace
    dots.needsUpdate = true

    return { slats, dots }
  }, [])

  const geometry = useMemo(
    () =>
      new THREE.CylinderGeometry(
        MOIRE_RADIUS,
        MOIRE_RADIUS,
        height,
        MOIRE_SEGMENTS,
        1,
        true
      ),
    [height]
  )

  const material = useMemo(
    () =>
      new THREE.MeshLambertMaterial({
        color: MOIRE_COLOR,
        map: textures.dots,
        alphaMap: textures.slats,
        transparent: true,
        opacity: MOIRE_OPACITY,
        depthWrite: false,
        side: THREE.BackSide,
      }),
    [textures]
  )

  // r3f solo libera lo que declara el JSX; éstas las creó `useMemo`.
  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
      textures.slats.dispose()
      textures.dots.dispose()
    },
    [geometry, material, textures]
  )

  // El handle expone la textura que el loop desplaza. Se pasa por `ref` y no
  // por un store porque no es un número que nadie más mire: es un objeto de
  // three que el `useFrame` muta.
  useEffect(() => {
    if (typeof ref === 'function') ref({ slats: textures.slats })
    else if (ref) ref.current = { slats: textures.slats }
  }, [ref, textures])

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={[0, MOIRE_BOTTOM + height / 2, 0]}
    />
  )
})
