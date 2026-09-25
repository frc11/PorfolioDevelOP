'use client'

import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

import {
  CYC_COVE_RADIUS,
  CYC_COVE_STEPS,
  CYC_WALL_TOP,
  FLOOR_RADIUS,
  FLOOR_SEGMENTS,
  FLOOR_THICKNESS,
  FLOOR_Y,
  PAPER_COLOR,
} from './probeScene'

/**
 * El piso: la losa y el ciclorama.
 *
 * **El ciclorama (S4).** El disco plano de radio 110 se partió en una losa plana
 * con espesor hasta el radio 34 y una superficie de revolución que curva hacia
 * arriba desde ahí hasta convertirse en pared. Es lo que hace un estudio real, y
 * resuelve el defecto que el disco tenía: por grande que fuera, el borde se leía
 * como una línea de horizonte dura. Acá el piso se convierte en fondo sin
 * transición y desde ningún ángulo hay una línea. Los números y el porqué de la
 * altura de la pared están en `probeScene.ts`.
 *
 * ── [ESCENA 2] La base limpia ──────────────────────────────────────────────
 *
 * Sin las marcas (las 48 barras de `floorMarks.ts`, que se fueron) y sin la
 * celosía: el papel ya no recibe la sombra de la cúpula, que barría el piso al
 * girar el sol con el scroll. Tampoco recibe sombra del logo: la escena no tiene
 * mapa de sombras y lo que apoya el logo es su oclusión de contacto.
 */

/**
 * Perfil del ciclorama, en (radio, altura sobre `FLOOR_Y`).
 *
 * Arranca en el borde de la losa plana con **tangente horizontal** —el centro
 * del arco está justo encima del punto de arranque, así que el radio ahí es
 * vertical— y termina vertical, para que la pared siga en la misma dirección
 * sin quiebre. Las dos tangencias son lo que hace que el empalme no se vea:
 * superficies que se tocan con la misma normal no dejan costura.
 */
const CYC_PROFILE: readonly THREE.Vector2[] = (() => {
  const points: THREE.Vector2[] = []

  for (let i = 0; i <= CYC_COVE_STEPS; i += 1) {
    const t = (i / CYC_COVE_STEPS) * (Math.PI / 2)
    points.push(
      new THREE.Vector2(
        FLOOR_RADIUS + CYC_COVE_RADIUS * Math.sin(t),
        CYC_COVE_RADIUS * (1 - Math.cos(t))
      )
    )
  }

  points.push(new THREE.Vector2(FLOOR_RADIUS + CYC_COVE_RADIUS, CYC_WALL_TOP))

  return points
})()

type StudioFloorProps = {
  /** [ESCENA 4] La losa se achica al claro cuando la formación pone un piso más bajo alrededor. */
  readonly radioDeLaLosa?: number
}

export function StudioFloor({ radioDeLaLosa = FLOOR_RADIUS }: StudioFloorProps) {
  const cycGeometry = useMemo(
    () => new THREE.LatheGeometry(CYC_PROFILE.slice(), FLOOR_SEGMENTS),
    []
  )

  const materials = useMemo(() => {
    const paper = () =>
      new THREE.MeshStandardMaterial({ color: PAPER_COLOR, roughness: 0.94, metalness: 0 })
    const slab = paper()
    const cyclorama = paper()
    cyclorama.side = THREE.DoubleSide
    return { slab, cyclorama }
  }, [])

  // r3f solo libera lo que declara el JSX; éstas las creó `useMemo`.
  useEffect(() => () => cycGeometry.dispose(), [cycGeometry])
  useEffect(
    () => () => {
      materials.slab.dispose()
      materials.cyclorama.dispose()
    },
    [materials]
  )

  return (
    <group>
      {/*
        La losa plana. Sigue siendo un cilindro con espesor —tiene canto y cara
        inferior, así que rasar el piso con la cámara sigue mostrando una
        escena— pero ahora termina donde arranca el ciclorama, no en un borde
        libre. `position` deja la cara SUPERIOR exactamente en FLOOR_Y.
      */}
      <mesh position={[0, FLOOR_Y - FLOOR_THICKNESS / 2, 0]} material={materials.slab}>
        <cylinderGeometry args={[radioDeLaLosa, radioDeLaLosa, FLOOR_THICKNESS, FLOOR_SEGMENTS]} />
      </mesh>

      {/*
        El ciclorama. Mismo material que la losa: en un estudio la cove y el
        piso son la misma superficie pintada del mismo color — lo único que los
        distingue es cómo les pega la luz, y de eso ya se encarga la normal.

        `DoubleSide` es deliberado y provisorio: el sentido de giro que
        `LatheGeometry` le da a las caras depende del orden del perfil, y ni S4
        ni S5 pueden abrir un navegador para verificarlo. Con `FrontSide` mal
        elegido la superficie sería invisible y el fondo se iría a negro. Una vez
        confirmado en pantalla, pasarlo a `THREE.FrontSide` es una línea y ahorra
        el descarte de caras traseras.
      */}
      <mesh position={[0, FLOOR_Y, 0]} geometry={cycGeometry} material={materials.cyclorama} />
    </group>
  )
}
