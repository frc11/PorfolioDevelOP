'use client'

import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

import {
  FRAGMENT_COLOR,
  FRAGMENT_RADIAL_SEGMENTS,
  FRAGMENT_TUBULAR_SEGMENTS,
  LOGO_FRAGMENTS,
} from './probeScene'

/**
 * Arcos sueltos de la marca: **las piezas que todavía no se ensamblaron.**
 *
 * Esa es la lectura que S5 les da, y es la que cierra el mundo de la escena. Si
 * el espacio es la maqueta de algo a medio construir y el logo es la única pieza
 * terminada, estos arcos son el resto de la pieza — todavía sueltos, todavía
 * flotando, todavía sin encastrar. Por eso en S5 dejaron de ser claros y pasaron
 * a material oscuro (ver `FRAGMENT_COLOR`): una pieza de lo mismo se ve del
 * material de lo mismo.
 *
 * **Es el único elemento de esta escena que no podría estar en el espacio de
 * otro.** El piso, las marcas, los planos y el polvo son vocabulario genérico:
 * bien hechos dan un render elegante, y cualquiera podría tener el mismo. Estos
 * arcos son lo que lo hace de develOP.
 *
 * **Los radios salen del propio SVG del logo, no de un ojo.** El `path` está
 * construido con dos arcos —uno de 153 y otro de 257 unidades del viewBox de
 * 1024— y son esos, escalados, los que flotan acá. Por eso se leen como
 * pedazos de la marca y no como anillos.
 *
 * **Con moderación: tres.** Es un acento. Cuatro ya empezarían a leerse como un
 * motivo, y un motivo competiría con el logo, que es exactamente lo que la
 * escena no puede hacer. S5 habilitaba sumar alguno más si la composición lo
 * pedía; con once planos, una retícula y tres pilares nuevos alrededor, lo que
 * la composición pide es lo contrario, así que siguen siendo tres. Lo que cambió
 * es el tono, que es lo que les da la lectura.
 *
 * Ni proyectan ni reciben sombra: están muy fuera de la ortográfica del shadow
 * map (±13) y meterlos ahí solo achicaría la resolución útil sobre el logo, que
 * es donde la sombra importa.
 */
export function LogoFragments() {
  const geometries = useMemo(
    () =>
      LOGO_FRAGMENTS.map(
        (fragment) =>
          new THREE.TorusGeometry(
            fragment.ringRadius,
            fragment.tube,
            FRAGMENT_RADIAL_SEGMENTS,
            FRAGMENT_TUBULAR_SEGMENTS,
            fragment.arc
          )
      ),
    []
  )

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: FRAGMENT_COLOR,
        roughness: 0.88,
        metalness: 0,
      }),
    []
  )

  // r3f solo libera lo que declara el JSX; éstas las creó `useMemo`.
  useEffect(
    () => () => {
      for (const geometry of geometries) geometry.dispose()
      material.dispose()
    },
    [geometries, material]
  )

  return (
    <group>
      {LOGO_FRAGMENTS.map((fragment, index) => (
        <mesh
          key={index}
          geometry={geometries[index]}
          material={material}
          position={fragment.position}
          rotation={fragment.rotation}
        />
      ))}
    </group>
  )
}
