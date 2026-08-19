'use client'

import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

import {
  SOFTBOXES,
  SOFTBOX_COLOR,
  SOFTBOX_FRAME_COLOR,
  SOFTBOX_FRAME_MARGIN,
} from './probeScene'

/**
 * Los paneles suspendidos alrededor del logo.
 *
 * **Es lo que más espacio aporta por menos costo.** Un panel a media distancia,
 * de forma y tamaño reconocibles, hace dos cosas que un fondo no puede: genera
 * paralaje contra el logo al orbitar, y **tapa cosas** — y un ocultamiento es
 * la señal de profundidad más fuerte que existe. Cuestan 9 draw calls y 48
 * triángulos entre los tres.
 *
 * **Ninguno brilla por sí mismo.** Van con `meshStandardMaterial`, no `basic`:
 * la regla del sprint es que nada se ilumine solo, y de paso así se apagan con
 * la sala en el cierre, cuando la luz principal baja de 3,40 a 0,20. Lo que los
 * hace "apenas más luminosos que el fondo" es el color, medio punto por encima
 * del papel — no una emisión.
 *
 * **La forma es la de un softbox de verdad: un marco con difusión estirada.** No
 * es decoración: es lo que resuelve verlos por detrás. Un plano brillante con
 * otro plano más grande atrás funcionaría solo desde un lado — desde el otro, el
 * "marco" quedaría adelante y taparía el cuerpo. Con un cuadro de espesor y una
 * tela en cada cara, el panel se lee igual desde cualquier punto de la órbita,
 * que es la condición cuando la cámara da la vuelta entera.
 *
 * Están fijos al mundo, no encarados a la cámara. Un billboard no generaría
 * paralaje: giraría con el observador y se leería como una calcomanía.
 */

/** Espesor del marco. Lo justo para que tenga canto cuando se lo ve de perfil. */
const FRAME_DEPTH = 0.12
/** Separación de la tela respecto de la cara del marco. Evita el z-fighting. */
const CLOTH_OFFSET = FRAME_DEPTH / 2 + 0.004

export function Softboxes() {
  // Una geometría y un material para los tres paneles: las dimensiones las pone
  // el `scale` de cada malla. Declararlas en el JSX crearía nueve de cada una.
  const frameGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const clothGeometry = useMemo(() => new THREE.PlaneGeometry(1, 1), [])

  const frameMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: SOFTBOX_FRAME_COLOR,
        roughness: 0.85,
        metalness: 0,
      }),
    []
  )

  const clothMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: SOFTBOX_COLOR,
        roughness: 0.98,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    []
  )

  useEffect(
    () => () => {
      frameGeometry.dispose()
      clothGeometry.dispose()
      frameMaterial.dispose()
      clothMaterial.dispose()
    },
    [frameGeometry, clothGeometry, frameMaterial, clothMaterial]
  )

  return (
    <group>
      {SOFTBOXES.map((box, index) => {
        const azimuth = THREE.MathUtils.degToRad(box.azimuthDeg)
        const clothWidth = Math.max(0.1, box.width - SOFTBOX_FRAME_MARGIN * 2)
        const clothHeight = Math.max(0.1, box.height - SOFTBOX_FRAME_MARGIN * 2)

        return (
          // Dos grupos anidados y no un solo `rotation={[tilt, yaw, 0]}`: con el
          // orden XYZ que three usa por default, la inclinación se aplicaría
          // sobre el eje X del PADRE y por lo tanto inclinaría cada panel en una
          // dirección distinta según su azimut. Anidados, el yaw arma el marco
          // local y la inclinación pasa adentro de ese marco, que es lo que
          // "inclinado hacia el logo" quiere decir.
          <group
            key={index}
            position={[
              Math.sin(azimuth) * box.radius,
              box.y,
              Math.cos(azimuth) * box.radius,
            ]}
            rotation={[0, azimuth, 0]}
          >
            <group rotation={[THREE.MathUtils.degToRad(box.tiltDeg), 0, 0]}>
              <mesh
                geometry={frameGeometry}
                material={frameMaterial}
                scale={[box.width, box.height, FRAME_DEPTH]}
              />
              <mesh
                geometry={clothGeometry}
                material={clothMaterial}
                scale={[clothWidth, clothHeight, 1]}
                position={[0, 0, CLOTH_OFFSET]}
              />
              <mesh
                geometry={clothGeometry}
                material={clothMaterial}
                scale={[clothWidth, clothHeight, 1]}
                position={[0, 0, -CLOTH_OFFSET]}
              />
            </group>
          </group>
        )
      })}
    </group>
  )
}
