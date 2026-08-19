'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import {
  CYC_COVE_RADIUS,
  CYC_COVE_STEPS,
  CYC_WALL_TOP,
  FLOOR_RADIUS,
  FLOOR_SEGMENTS,
  FLOOR_THICKNESS,
  FLOOR_Y,
  MARK_CENTER_ARM,
  MARK_COLOR,
  MARK_CROSS_ARM,
  MARK_CROSS_OFFSET,
  MARK_HEIGHT,
  MARK_LENGTH,
  MARK_OUTER_LENGTH,
  MARK_OUTER_SPAN,
  MARK_SOFT_COLOR,
  MARK_SPAN,
  MARK_TAPE_COLOR,
  MARK_TICK_LENGTH,
  MARK_WIDTH,
  PAPER_COLOR,
  TAPE_AZIMUTHS_DEG,
  TAPE_BAR,
  TAPE_RADIUS,
  TAPE_STEM,
  TAPE_WIDTH,
} from './probeScene'

/**
 * El estudio: el ciclorama y el sistema de marcas de piso.
 *
 * **El ciclorama (S4).** El disco plano de radio 110 se partió en una losa
 * plana con espesor hasta el radio 34 y una superficie de revolución que curva
 * hacia arriba desde ahí hasta convertirse en pared. Es lo que hace un estudio
 * real, y resuelve el defecto que el disco tenía: por grande que fuera, el
 * borde se leía como una línea de horizonte dura. Acá el piso se convierte en
 * fondo sin transición y desde ningún ángulo hay una línea. Los números y el
 * porqué de la altura de la pared están en `probeScene.ts`.
 *
 * **Las marcas (S4).** Las cuatro esquinas de registro pasaron a ser un set de
 * 32 barras: marco de encuadre interior, ticks a media cara, cruces de
 * registro, marco exterior y cintas de posición. Van todas en **un solo
 * `<instancedMesh>`** — un draw call, contra los ocho que costaban las cuatro
 * esquinas de antes.
 *
 * Todo esto sigue la misma regla que el sprint original: dar profundidad sin
 * pedir atención. Son objetos de tamaño conocido apoyados en el piso, así que
 * al orbitar dan la lectura de perspectiva que un plano vacío no da; y ninguno
 * compite en peso visual con el logo.
 */

type MarkPlacement = {
  readonly position: readonly [number, number, number]
  readonly scale: readonly [number, number, number]
  /** Solo las cintas lo usan: son las únicas que no están alineadas a los ejes. */
  readonly rotationY?: number
  readonly color: string
}

/**
 * Un pelo de elevación para el segundo brazo de cada cruz.
 *
 * Dos cajas coplanares que se cruzan comparten exactamente el mismo valor de
 * profundidad en la zona de solape, y ahí el z-buffer no tiene forma de
 * decidir: aparece el titileo. Levantar un brazo 0,0015 —una décima parte del
 * espesor de la propia marca, invisible— lo resuelve sin geometría extra.
 */
const CROSS_LIFT = 0.0015

/**
 * Las 32 barras, calculadas una vez al importar el módulo. No dependen de nada
 * en runtime, así que no tienen por qué recalcularse en cada montaje.
 */
const MARK_PLACEMENTS: readonly MarkPlacement[] = (() => {
  const y = FLOOR_Y + MARK_HEIGHT / 2
  const marks: MarkPlacement[] = []

  const corners: readonly (readonly [number, number])[] = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]

  // 1 · Marco interior — cuatro esquinas en "L" con los brazos hacia adentro.
  //     Es el mismo cuadro del probe original: encierra la huella del logo.
  const inset = MARK_SPAN - MARK_LENGTH / 2
  for (const [sx, sz] of corners) {
    marks.push({
      position: [sx * inset, y, sz * MARK_SPAN],
      scale: [MARK_LENGTH, MARK_HEIGHT, MARK_WIDTH],
      color: MARK_COLOR,
    })
    marks.push({
      position: [sx * MARK_SPAN, y, sz * inset],
      scale: [MARK_WIDTH, MARK_HEIGHT, MARK_LENGTH],
      color: MARK_COLOR,
    })
  }

  // 2 · Ticks a media cara del cuadro interior. Marcan el centro de cada lado,
  //     que es lo que un encuadre necesita para centrar algo a ojo.
  const tickInset = MARK_SPAN - MARK_TICK_LENGTH / 2
  for (const sign of [-1, 1]) {
    marks.push({
      position: [0, y, sign * tickInset],
      scale: [MARK_WIDTH, MARK_HEIGHT, MARK_TICK_LENGTH],
      color: MARK_COLOR,
    })
    marks.push({
      position: [sign * tickInset, y, 0],
      scale: [MARK_TICK_LENGTH, MARK_HEIGHT, MARK_WIDTH],
      color: MARK_COLOR,
    })
  }

  // 3 · Cruz de centro, justo debajo del logo.
  marks.push({
    position: [0, y, 0],
    scale: [MARK_CENTER_ARM * 2, MARK_HEIGHT, MARK_WIDTH],
    color: MARK_COLOR,
  })
  marks.push({
    position: [0, y + CROSS_LIFT, 0],
    scale: [MARK_WIDTH, MARK_HEIGHT, MARK_CENTER_ARM * 2],
    color: MARK_COLOR,
  })

  // 4 · Dos cruces de registro en cuadrantes opuestos.
  for (const [sx, sz] of [
    [-1, 1],
    [1, -1],
  ] as const) {
    const cx = sx * MARK_CROSS_OFFSET
    const cz = sz * MARK_CROSS_OFFSET
    marks.push({
      position: [cx, y, cz],
      scale: [MARK_CROSS_ARM * 2, MARK_HEIGHT, MARK_WIDTH],
      color: MARK_COLOR,
    })
    marks.push({
      position: [cx, y + CROSS_LIFT, cz],
      scale: [MARK_WIDTH, MARK_HEIGHT, MARK_CROSS_ARM * 2],
      color: MARK_COLOR,
    })
  }

  // 5 · Marco exterior, al doble de span y más claro. Da una SEGUNDA escala de
  //     referencia: con una sola, la perspectiva se lee a una única distancia.
  const outerInset = MARK_OUTER_SPAN - MARK_OUTER_LENGTH / 2
  for (const [sx, sz] of corners) {
    marks.push({
      position: [sx * outerInset, y, sz * MARK_OUTER_SPAN],
      scale: [MARK_OUTER_LENGTH, MARK_HEIGHT, MARK_WIDTH],
      color: MARK_SOFT_COLOR,
    })
    marks.push({
      position: [sx * MARK_OUTER_SPAN, y, sz * outerInset],
      scale: [MARK_WIDTH, MARK_HEIGHT, MARK_OUTER_LENGTH],
      color: MARK_SOFT_COLOR,
    })
  }

  // 6 · Cintas de posición en "T". Son las únicas marcas rotadas: la barra va
  //     perpendicular al radio y el pie apunta al centro, como una marca de
  //     piso de set. Con `rotationY = azimut`, el +X local cae sobre la
  //     tangente y el +Z local sobre el radio hacia afuera.
  for (const azimuthDeg of TAPE_AZIMUTHS_DEG) {
    const azimuth = THREE.MathUtils.degToRad(azimuthDeg)
    const sin = Math.sin(azimuth)
    const cos = Math.cos(azimuth)
    const stemRadius = TAPE_RADIUS - TAPE_WIDTH / 2 - TAPE_STEM / 2

    marks.push({
      position: [sin * TAPE_RADIUS, y, cos * TAPE_RADIUS],
      scale: [TAPE_BAR, MARK_HEIGHT, TAPE_WIDTH],
      rotationY: azimuth,
      color: MARK_TAPE_COLOR,
    })
    marks.push({
      position: [sin * stemRadius, y, cos * stemRadius],
      scale: [TAPE_WIDTH, MARK_HEIGHT, TAPE_STEM],
      rotationY: azimuth,
      color: MARK_TAPE_COLOR,
    })
  }

  return marks
})()

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
  const marksRef = useRef<THREE.InstancedMesh>(null)

  // Una geometría y un material para las 32 barras.
  const markGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const markMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0 }),
    []
  )

  const cycGeometry = useMemo(
    () => new THREE.LatheGeometry(CYC_PROFILE.slice(), FLOOR_SEGMENTS),
    []
  )

  useEffect(
    () => () => {
      markGeometry.dispose()
      markMaterial.dispose()
      cycGeometry.dispose()
    },
    [markGeometry, markMaterial, cycGeometry]
  )

  /**
   * Las matrices y los colores por instancia. Va en un efecto y no en el render
   * porque escribir sobre el `InstancedMesh` es un efecto secundario sobre un
   * objeto de three, no una descripción de UI.
   *
   * `computeBoundingSphere()` al final no es opcional: la esfera que un
   * `InstancedMesh` hereda de su geometría es la de UNA caja unitaria en el
   * origen, así que el frustum culling descartaría las 32 barras apenas el
   * origen saliera de cuadro. La versión de `InstancedMesh` sí recorre las
   * matrices.
   */
  useEffect(() => {
    const mesh = marksRef.current
    if (!mesh) return

    const dummy = new THREE.Object3D()
    const color = new THREE.Color()

    MARK_PLACEMENTS.forEach((mark, index) => {
      dummy.position.set(...mark.position)
      dummy.rotation.set(0, mark.rotationY ?? 0, 0)
      dummy.scale.set(...mark.scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
      mesh.setColorAt(index, color.set(mark.color))
    })

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [])

  return (
    <group>
      {/*
        La losa plana. Sigue siendo un cilindro con espesor —tiene canto y cara
        inferior, así que rasar el piso con la cámara sigue mostrando una
        escena— pero ahora termina donde arranca el ciclorama, no en un borde
        libre. `position` deja la cara SUPERIOR exactamente en FLOOR_Y.

        Sin `castShadow`: no hay nada debajo que pueda recibir su sombra, y
        meterla en el shadow map solo arriesgaba acné sobre su propia cara y
        sobre las marcas, que están 0,012 encima.
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
        `LatheGeometry` le da a las caras depende del orden del perfil, y este
        sprint no puede abrir un navegador para verificarlo. Con `FrontSide` mal
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

      <instancedMesh
        ref={marksRef}
        args={[markGeometry, markMaterial, MARK_PLACEMENTS.length]}
        receiveShadow
      />
    </group>
  )
}
