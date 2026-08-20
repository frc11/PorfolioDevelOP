'use client'

import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

import { MARK_PLACEMENTS } from './floorMarks'
import { InstancedBars } from './InstancedBars'
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
 * El piso: la losa, el ciclorama y el set de marcas.
 *
 * **El ciclorama (S4).** El disco plano de radio 110 se partió en una losa plana
 * con espesor hasta el radio 34 y una superficie de revolución que curva hacia
 * arriba desde ahí hasta convertirse en pared. Es lo que hace un estudio real, y
 * resuelve el defecto que el disco tenía: por grande que fuera, el borde se leía
 * como una línea de horizonte dura. Acá el piso se convierte en fondo sin
 * transición y desde ningún ángulo hay una línea. Los números y el porqué de la
 * altura de la pared están en `probeScene.ts`.
 *
 * **Las marcas.** Su geometría y su razón de ser viven en `floorMarks.ts`; acá
 * solo se dibujan. Son 48 barras en **un solo draw call** (ver `InstancedBars`),
 * y en S5 pasaron de marcas de estudio a lenguaje de plano: ejes, cotas y una
 * escala graduada además del encuadre y las cintas.
 *
 * Todo esto sigue la misma regla que el sprint original: dar profundidad sin
 * pedir atención. Son objetos de tamaño conocido apoyados en el piso, así que al
 * orbitar dan la lectura de perspectiva que un plano vacío no da; y ninguno
 * compite en peso visual con el logo.
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

export function StudioFloor() {
  const cycGeometry = useMemo(
    () => new THREE.LatheGeometry(CYC_PROFILE.slice(), FLOOR_SEGMENTS),
    []
  )

  // r3f solo libera lo que declara el JSX; ésta la creó `useMemo`.
  useEffect(() => () => cycGeometry.dispose(), [cycGeometry])

  return (
    <group>
      {/*
        La losa plana. Sigue siendo un cilindro con espesor —tiene canto y cara
        inferior, así que rasar el piso con la cámara sigue mostrando una
        escena— pero ahora termina donde arranca el ciclorama, no en un borde
        libre. `position` deja la cara SUPERIOR exactamente en FLOOR_Y.

        Sin `castShadow`: no hay nada debajo que pueda recibir su sombra, y
        meterla en el shadow map solo arriesgaba acné sobre su propia cara y
        sobre las marcas, que están apoyadas encima.
      */}
      <mesh position={[0, FLOOR_Y - FLOOR_THICKNESS / 2, 0]} receiveShadow>
        <cylinderGeometry args={[FLOOR_RADIUS, FLOOR_RADIUS, FLOOR_THICKNESS, FLOOR_SEGMENTS]} />
        <meshStandardMaterial color={PAPER_COLOR} roughness={0.94} metalness={0} />
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
      <mesh position={[0, FLOOR_Y, 0]} geometry={cycGeometry} receiveShadow>
        <meshStandardMaterial
          color={PAPER_COLOR}
          roughness={0.94}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      <InstancedBars placements={MARK_PLACEMENTS} receiveShadow />
    </group>
  )
}
