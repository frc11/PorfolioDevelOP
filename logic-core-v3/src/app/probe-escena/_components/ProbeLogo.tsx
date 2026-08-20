'use client'

import { useLoader } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { SVGLoader } from 'three-stdlib'
import * as THREE from 'three'

import { INK_COLOR, INK_ROUGHNESS, PROBE_EXTRUDE, PROBE_SVG_SCALE } from './probeScene'
import type { ProbeStatsStore } from './probeStore'

/**
 * El logo del probe: **artefacto NUEVO**, no el frozen.
 *
 * `HeroArtifact.tsx` está congelado y no se toca; además trae adentro tres
 * cosas que arruinarían esta medición: material cromado (`metalness=1`, que sin
 * HDRI se renderiza negro plano), flotado perpetuo en el `useFrame` (un objeto
 * que se mueve solo no se puede juzgar por ángulo) y un auto-cull por
 * `scrollY`. Acá el objeto está **quieto** y **mate**, que es la única forma de
 * que lo que cambie en pantalla sea la cámara y nada más.
 *
 * Lo que SÍ se copia del frozen, exacto, porque es el objeto bajo prueba:
 * el mismo SVG, la misma escala (0.007) y los mismos parámetros de extrusión.
 */

/** Igual que el frozen: el SVG viene con el eje Y para abajo. */
const SVG_FLIP: readonly [number, number, number] = [Math.PI, 0, 0]

type ProbeLogoProps = {
  stats: ProbeStatsStore
  /** Se dispara una vez, cuando el objeto existe en la escena. Nunca por frame. */
  onReady: () => void
}

export function ProbeLogo({ stats, onReady }: ProbeLogoProps) {
  const svgData = useLoader(SVGLoader, '/logodevelOP.svg')

  /**
   * Geometrías centradas en su PROPIA caja, no en el viewBox del SVG.
   *
   * El frozen centra por `position={[-512, -512, 0]}`, que asume que la tinta
   * llena el viewBox de 1024 y deja la extrusión creciendo hacia un solo lado.
   * Para un encuadre estático da igual; para una órbita no: cualquier
   * descentrado hace que el objeto se bambolee en cuadro al girar la cámara, y
   * ese bamboleo se lee como un defecto del objeto cuando es del pivote.
   *
   * Centrar en los tres ejes deja el eje de la órbita pasando por el centro
   * real de la pieza. De paso, la caja medida es el dato que se publica.
   */
  const geometries = useMemo(() => {
    const shapes = svgData.paths.flatMap((path) => path.toShapes(true))
    const built = shapes.map((shape) => new THREE.ExtrudeGeometry(shape, PROBE_EXTRUDE))

    const box = new THREE.Box3()
    for (const geometry of built) {
      geometry.computeBoundingBox()
      if (geometry.boundingBox) box.union(geometry.boundingBox)
    }

    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    for (const geometry of built) {
      geometry.translate(-center.x, -center.y, -center.z)
      geometry.computeBoundingBox()
      geometry.computeBoundingSphere()
    }

    return { built, size }
  }, [svgData])

  // Publica la caja real (en unidades de mundo) y avisa que la escena existe.
  // Un efecto y no el render: escribir en un store durante el render es un
  // efecto secundario, y `onReady` levanta estado en el componente de arriba.
  useEffect(() => {
    stats.set('logoW', geometries.size.x * PROBE_SVG_SCALE)
    stats.set('logoH', geometries.size.y * PROBE_SVG_SCALE)
    stats.set('logoD', geometries.size.z * PROBE_SVG_SCALE)
    onReady()
  }, [geometries, stats, onReady])

  // r3f solo libera lo que declara el JSX; estas las creó `useMemo`.
  useEffect(() => {
    const built = geometries.built
    return () => {
      for (const geometry of built) geometry.dispose()
    }
  }, [geometries])

  return (
    <group scale={PROBE_SVG_SCALE} rotation={SVG_FLIP}>
      {geometries.built.map((geometry, index) => (
        <mesh key={index} geometry={geometry} castShadow receiveShadow>
          {/*
            Negro MATE, la decisión ya tomada del sprint: `metalness=0`, sin
            entorno que reflejar (el HDRI de 1,27 MiB del hero) y sin cromado.

            **Lo que S6 corrigió es la rugosidad, y es el número que le da forma
            al objeto.** Un negro de albedo casi nulo no se describe con luz
            difusa —por más intensidad que se le ponga, sigue siendo negro—; lo
            único que dibuja su volumen es el reflejo especular, que no depende
            del albedo. Con 0,52 ese reflejo estaba tan repartido que el logo se
            leía plano; con `INK_ROUGHNESS` el lóbulo se cierra lo suficiente
            para que la cara, el bisel y el canto se separen, y para que el
            contraluz tenga dónde dibujarse. El porqué del valor está en
            `probeScene.ts`.

            `DoubleSide` igual que el frozen — el SVG no garantiza el sentido de
            giro de sus contornos, y de paso llena el shadow map por atrás, que
            en una pieza tan fina evita que la sombra se despegue del objeto.
          */}
          <meshStandardMaterial
            color={INK_COLOR}
            roughness={INK_ROUGHNESS}
            metalness={0}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}
