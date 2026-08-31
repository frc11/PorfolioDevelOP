'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import { applyCelosia, type CelosiaUniforms } from './celosiaShader'
import type { BarPlacement } from './probeScene'

/**
 * MUCHAS CAJAS, UN DRAW CALL.
 *
 * Es la primitiva compartida de casi toda la escena: las marcas de piso, los
 * planos suspendidos, la retícula del techo y los pilares son todos cajas — lo
 * que cambia entre ellas es la escala, el giro y el tono, no la forma. Cada
 * familia entra acá con su lista de posiciones y sale como **una sola malla
 * instanciada**, o sea un draw call, en vez de uno por pieza.
 *
 * Ese es todo el motivo por el que la escena de S5 puede permitirse casi ochenta
 * piezas nuevas y bajar los draw calls igual.
 *
 * ── Las tres cosas que hay que hacer bien ──────────────────────────────────
 *
 * 1. **`computeBoundingSphere()` no es opcional.** La esfera que un
 *    `InstancedMesh` hereda de su geometría es la de UNA caja unitaria en el
 *    origen; sin recalcularla contra las matrices, el frustum culling descarta
 *    la familia entera apenas el origen sale de cuadro. La versión de
 *    `InstancedMesh` sí recorre las instancias.
 * 2. **El giro va en orden YXZ.** Primero el azimut, la inclinación después y
 *    adentro del marco ya girado. Con el XYZ de three, la inclinación se
 *    aplicaría sobre el eje X del padre y cada pieza se inclinaría hacia un lado
 *    distinto según su azimut.
 * 3. **El color por instancia va en el material blanco.** `instanceColor`
 *    multiplica al color del material, así que el material se deja en su blanco
 *    por default y el tono lo pone cada instancia. Es lo que permite que una
 *    familia tenga dos tonos sin costar dos draw calls.
 *
 * Las matrices se escriben en un efecto y no en el render: mutar un objeto de
 * three es un efecto secundario, no una descripción de UI.
 */

type InstancedBarsProps = {
  placements: readonly BarPlacement[]
  /** Mate por default: en esta escena nada tiene brillo especular propio. */
  roughness?: number
  castShadow?: boolean
  receiveShadow?: boolean
  /**
   * Si viene, las barras reciben la celosía igual que el papel sobre el que
   * están apoyadas (S11). **No es opcional por gusto**: una marca que siguiera
   * iluminada pareja mientras el piso que la rodea lleva bandas se leería como
   * una línea encendida cruzando la sombra. El eje de X mide 13 unidades de
   * largo; atraviesa cinco bandas.
   */
  celosia?: CelosiaUniforms
}

export function InstancedBars({
  placements,
  roughness = 0.9,
  castShadow = false,
  receiveShadow = false,
  celosia,
}: InstancedBarsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const material = useMemo(() => {
    const built = new THREE.MeshStandardMaterial({ roughness, metalness: 0 })
    if (celosia) applyCelosia(built, celosia)
    return built
  }, [roughness, celosia])

  // r3f solo libera lo que declara el JSX; éstas las creó `useMemo`.
  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    const dummy = new THREE.Object3D()
    const color = new THREE.Color()

    placements.forEach((placement, index) => {
      dummy.position.set(...placement.position)
      const rotation = placement.rotation
      dummy.rotation.set(rotation?.[0] ?? 0, rotation?.[1] ?? 0, rotation?.[2] ?? 0, 'YXZ')
      dummy.scale.set(...placement.scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
      mesh.setColorAt(index, color.set(placement.color))
    })

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [placements])

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, placements.length]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    />
  )
}
