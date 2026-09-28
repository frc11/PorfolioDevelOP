'use client'

import { useEffect, useMemo } from 'react'
import { mergeBufferGeometries } from 'three-stdlib'
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
import { VIVO } from './entorno/vivo'
import { CORRIDO_POR_PIXEL, NIEBLA_DE_AFUERA, RASANTE_GLSL } from './niebla/rasante'
import { conElDiaDesdeAfuera } from './dia/desdeAfuera'

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
 * Perfil del ciclorama, en (radio, altura sobre `FLOOR_Y`), arrancando en `desde` a la altura `bajo`.
 *
 * Arranca en el borde del piso plano con **tangente horizontal** —el centro
 * del arco está justo encima del punto de arranque, así que el radio ahí es
 * vertical— y termina vertical, para que la pared siga en la misma dirección
 * sin quiebre. Las dos tangencias son lo que hace que el empalme no se vea:
 * superficies que se tocan con la misma normal no dejan costura.
 */
function perfilDelCiclorama(desde: number, bajo: number): THREE.Vector2[] {
  const points: THREE.Vector2[] = []

  for (let i = 0; i <= CYC_COVE_STEPS; i += 1) {
    const t = (i / CYC_COVE_STEPS) * (Math.PI / 2)
    points.push(
      new THREE.Vector2(
        desde + CYC_COVE_RADIUS * Math.sin(t),
        bajo + CYC_COVE_RADIUS * (1 - Math.cos(t))
      )
    )
  }

  points.push(new THREE.Vector2(desde + CYC_COVE_RADIUS, CYC_WALL_TOP))

  return points
}

/**
 * [ESCENA 5] El escenario: nuestro piso termina en `radio`, y alrededor hay otro `desnivel` más abajo,
 * hasta `hasta`. [ESCENA 7] Ese piso es PLANO (la pendiente de ESCENA 6 se fue: la profundidad de la
 * formación sale de la perspectiva) y llega hasta el horizonte, donde la bruma lo termina: no hay
 * ciclorama, la fábrica no tiene paredes.
 */
export interface Escenario {
  readonly radio: number
  readonly desnivel: number
  readonly hasta: number
}

type StudioFloorProps = {
  /** [ESCENA 5] Con la formación, el piso es un escenario con otro más bajo alrededor, hasta el horizonte. */
  readonly escenario?: Escenario
  /** [ESCENA 6] 6c: el piso de abajo y el ciclorama integran la niebla rasante (`niebla/rasante.ts`). */
  readonly conNieblaRasante?: boolean
  /**
   * [ESCENA 7] Con el piso vivo no hay losa: los bloques cubren el disco entero y bajan más que ella en los
   * valles. El canto del escenario arranca entonces al ras del piso.
   */
  readonly conPisoVivo?: boolean
}

/** [ESCENA 6] 6c: el material del papel de afuera, con los bancos que cada punto tiene delante. */
function conLaNiebla(material: THREE.MeshStandardMaterial): void {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, { uTiempo: VIVO.uTiempo, uAbre: NIEBLA_DE_AFUERA.uAbre })
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vMundoRasante;')
      .replace('#include <project_vertex>', '#include <project_vertex>\n\tvMundoRasante = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vMundoRasante;\nuniform float uTiempo;\nuniform float uAbre;\n${RASANTE_GLSL}`)
      .replace('#include <fog_fragment>', `#include <fog_fragment>\n\t#ifdef USE_FOG\n\t\tgl_FragColor.rgb = mix( fogColor, gl_FragColor.rgb, transmitanciaRasante( cameraPosition, vMundoRasante, uAbre, ${CORRIDO_POR_PIXEL} ) );\n\t#endif`)
  }
  material.customProgramCacheKey = () => 'papel-con-niebla-rasante'
}

/** El canto del escenario y el piso de abajo, en una sola malla (relativa a `FLOOR_Y`). `desde`: dónde arranca el canto. */
function geometriaDelPisoDeAbajo(e: Escenario, desde: number): THREE.BufferGeometry {
  const canto = new THREE.CylinderGeometry(e.radio, e.radio, e.desnivel - desde, FLOOR_SEGMENTS, 1, true)
  canto.translate(0, -desde - (e.desnivel - desde) / 2, 0)
  // Anillos concéntricos: con uno solo, los triángulos largos hasta el horizonte interpolan mal la bruma.
  const piso = new THREE.RingGeometry(e.radio, e.hasta, FLOOR_SEGMENTS, 12)
  piso.rotateX(-Math.PI / 2)
  piso.translate(0, -e.desnivel, 0)
  const junta = mergeBufferGeometries([canto, piso]) ?? piso
  for (const g of [canto, piso]) if (g !== junta) g.dispose()
  return junta
}

export function StudioFloor({ escenario, conNieblaRasante = false, conPisoVivo = false }: StudioFloorProps) {
  const radioDeLaLosa = escenario?.radio ?? FLOOR_RADIUS
  const cycGeometry = useMemo(() => new THREE.LatheGeometry(perfilDelCiclorama(FLOOR_RADIUS, 0), FLOOR_SEGMENTS), [])
  const pisoDeAbajo = useMemo(() => (escenario === undefined ? null : geometriaDelPisoDeAbajo(escenario, conPisoVivo ? 0 : FLOOR_THICKNESS)), [escenario, conPisoVivo])

  const materials = useMemo(() => {
    const paper = () =>
      new THREE.MeshStandardMaterial({ color: PAPER_COLOR, roughness: 0.94, metalness: 0 })
    const slab = paper()
    const cyclorama = paper()
    cyclorama.side = THREE.DoubleSide
    if (conNieblaRasante) conLaNiebla(cyclorama)
    // [ESCENA 6] 6g: con la variante, el barrido del día (no hace nada sin la bandera).
    conElDiaDesdeAfuera(slab)
    conElDiaDesdeAfuera(cyclorama)
    return { slab, cyclorama }
  }, [conNieblaRasante])

  // r3f solo libera lo que declara el JSX; éstas las creó `useMemo`.
  useEffect(() => () => cycGeometry.dispose(), [cycGeometry])
  useEffect(() => () => pisoDeAbajo?.dispose(), [pisoDeAbajo])
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
      {!conPisoVivo && (
        <mesh position={[0, FLOOR_Y - FLOOR_THICKNESS / 2, 0]} material={materials.slab}>
          <cylinderGeometry args={[radioDeLaLosa, radioDeLaLosa, FLOOR_THICKNESS, FLOOR_SEGMENTS]} />
        </mesh>
      )}

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
      {/* [ESCENA 7] Con la formación no hay ciclorama: el piso de abajo llega al horizonte. */}
      {escenario === undefined && <mesh position={[0, FLOOR_Y, 0]} geometry={cycGeometry} material={materials.cyclorama} />}
      {/* [ESCENA 5] El canto del escenario y el piso de la formación: el mismo papel. */}
      {pisoDeAbajo !== null && <mesh position={[0, FLOOR_Y, 0]} geometry={pisoDeAbajo} material={materials.cyclorama} />}
    </group>
  )
}
