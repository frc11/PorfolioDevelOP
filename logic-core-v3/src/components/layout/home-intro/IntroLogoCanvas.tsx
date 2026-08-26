'use client'

import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { SVGLoader } from 'three-stdlib'
import * as THREE from 'three'

import {
  INK_COLOR,
  INK_ROUGHNESS,
  PROBE_EXTRUDE,
} from '@/app/probe-escena/_components/probeScene'
import { LOGO_INK_VIEWBOX } from '@/components/ui/LogoMark'
import { SCENE_ENTRY_VIEW } from '@/lib/scene-framing'

import type { IntroLogoCanvasProps } from './IntroLogo3D'
import { IntroSceneLights } from './IntroSceneLights'
import { IntroShadowPlane } from './IntroShadowPlane'
import { sampleInkShading } from './introRig'
import { hexToSrgb, solveEmissiveForSrgb } from './introShading'

/**
 * EL LOGO 3D DEL PRELOADER — el mismo objeto de la escena, que hasta el final se
 * lee como un dibujo plano.
 *
 * ── La ilusión, y dónde se esconde el relevo ───────────────────────────────
 *
 * El trazo no se puede dibujar sobre un mesh (`strokeDashoffset` es de SVG), así
 * que el dibujado y el relleno son SVG. El relevo ocurre **adentro de la
 * transformación de color**, en su centro, donde el logo y el fondo tienen el
 * contraste más bajo de toda la secuencia. Y las dos capas llevan el **mismo
 * color**: el `#RRGGBB` que pinta el SVG entra acá como `MotionValue` y se
 * convierte en la emisiva del material. No son dos cálculos que haya que
 * sincronizar — es el mismo string.
 *
 * ⚠️ **Cómo se logra que se vea plano: NO iluminándolo.** Iluminarlo de frente
 * —lo que hacía S8b— es el peor caso posible: pone el pico del especular sobre
 * toda la cara y el logo sale casi blanco. La derivación completa está en
 * `introShading.ts`. Acá solo se aplica el cruce, y ese cruce ocurre **durante
 * el acomodamiento**: de emisiva plana sin una sola luz, al rig de la escena
 * con su sombra.
 *
 * ── Cámara ORTOGRÁFICA en espacio de píxeles CSS ───────────────────────────
 *
 * `<Canvas orthographic>` con `zoom: 1`: r3f pone el frustum en
 * `[-w/2, w/2] × [-h/2, h/2]` **en píxeles CSS** (verificado en
 * `events-*.cjs.dev.js:514`), así que **una unidad de mundo es un píxel**.
 * Escalando el mesh por `alto en px / alto de la tinta en unidades de viewBox`,
 * su silueta es la del path SVG, píxel por píxel, sin calibración de por medio.
 * Y de frente, sin perspectiva, los cantos son invisibles: la pieza se lee plana
 * sin trucos.
 *
 * El canvas es de todo el viewport y el CSS no lo toca: el tamaño y la posición
 * del logo los maneja la cámara, así que está nítido en cada frame y puede salir
 * de la caja del lockup sin recortarse.
 *
 * ── Sin eventos ────────────────────────────────────────────────────────────
 *
 * `style={{ pointerEvents: 'none' }}`: r3f le pone `'auto'` a su propio div
 * (`react-three-fiber.cjs.dev.js:151`) y por eso un `pointer-events: none` de un
 * ancestro no alcanza — la lección ya documentada en `CLAUDE.md`. Pero el
 * `...style` del usuario se aplica DESPUÉS (`:154-160`), así que esto sí gana.
 *
 * ── Cero `setState` por frame ──────────────────────────────────────────────
 *
 * Todo lo que cambia por frame entra como `MotionValue` y se lee con `.get()`
 * dentro del `useFrame`. React no re-renderiza ni una vez durante la secuencia.
 */

const DEG = Math.PI / 180

/** Igual que el frozen y el probe: el SVG viene con el eje Y para abajo. */
const SVG_FLIP: readonly [number, number, number] = [Math.PI, 0, 0]

function IntroLogoMesh({
  centerX,
  centerY,
  inkHeightPx,
  reveal,
  opacity,
  ink,
  onReady,
}: IntroLogoCanvasProps) {
  const svgData = useLoader(SVGLoader, '/logodevelOP.svg')
  const size = useThree((state) => state.size)

  const placer = useRef<THREE.Group>(null)
  const tilt = useRef<THREE.Group>(null)
  // Resolver la emisiva cuesta tres bisecciones; el color solo cambia durante la
  // inversión de la tinta, así que la inmensa mayoría de los frames la saltean.
  const inkCacheRef = useRef({ hex: '', emissive: [0, 0, 0] as readonly number[] })

  /**
   * Geometrías centradas en su PROPIA caja, igual que `ProbeLogo`: el eje de la
   * rotación de revelación tiene que pasar por el centro real de la pieza, o el
   * logo se bambolearía al inclinarse.
   *
   * La ESCALA en cambio sale de `LOGO_INK_VIEWBOX`, la caja del path SIN el
   * bisel: el SVG dibuja el path, así que para que las dos siluetas midan lo
   * mismo hay que escalar por lo mismo. El bisel (1 unidad por lado, sub-píxel)
   * asoma un pelo por fuera, que es lo correcto — es geometría real del objeto.
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
    for (const geometry of built) {
      geometry.translate(-center.x, -center.y, -center.z)
      geometry.computeBoundingBox()
      geometry.computeBoundingSphere()
    }
    return built
  }, [svgData])

  /**
   * Los materiales de las piezas del logo, declarados en el JSX para que r3f los
   * libere solo, y recogidos acá para escribirles la emisiva y la opacidad **en
   * el mismo frame**: son el mismo material repetido, así que las piezas no
   * pueden divergir. Es el material de la escena, sin cromado, y `DoubleSide`
   * como el frozen — el SVG no garantiza el sentido de giro de sus contornos.
   *
   * `transparent` porque el relevo es un cruce con alfa, no un salto.
   */
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([])

  // Un efecto y no el render: `onReady` levanta estado en el componente de
  // arriba. Se dispara UNA vez, cuando el objeto ya existe en la escena.
  useEffect(() => {
    onReady()
  }, [geometries, onReady])

  // r3f solo libera lo que declara el JSX; estas las creó este componente.
  useEffect(() => {
    return () => {
      for (const geometry of geometries) geometry.dispose()
    }
  }, [geometries])

  useFrame(() => {
    const group = placer.current
    if (!group) return

    // Antes del relevo el objeto existe pero no se dibuja: el SVG lo cubre.
    const alpha = opacity.get()
    group.visible = alpha > 0
    if (!group.visible) return

    // 1 unidad de mundo = 1 píxel CSS, así que la escala es directa. El alto no
    // depende del progreso: el logo no cambia de tamaño en toda la secuencia.
    group.scale.setScalar(inkHeightPx.get() / LOGO_INK_VIEWBOX.height)
    group.position.set(centerX.get() - size.width / 2, -(centerY.get() - size.height / 2), 0)

    // La revelación: de plano y de frente a la pose que la escena va a mirar.
    // Orden YXZ — el azimut va por fuera, como en una órbita. El MISMO número
    // mueve la posición del grupo de arriba, así que giro y traslación son un
    // solo gesto.
    const revealed = reveal.get()
    if (tilt.current) {
      tilt.current.rotation.set(
        SCENE_ENTRY_VIEW.pitchDeg * DEG * revealed,
        -SCENE_ENTRY_VIEW.yawDeg * DEG * revealed,
        0,
        'YXZ'
      )
    }

    // El color: el mismo string que pinta el SVG, convertido en emisiva.
    const hex = ink.get()
    if (hex !== inkCacheRef.current.hex) {
      inkCacheRef.current = { hex, emissive: solveEmissiveForSrgb(hexToSrgb(hex)) }
    }
    const shading = sampleInkShading(revealed)
    const emissive = inkCacheRef.current.emissive
    for (const material of materialsRef.current) {
      material.opacity = alpha
      material.emissive.setRGB(
        emissive[0] * shading.emissiveMix,
        emissive[1] * shading.emissiveMix,
        emissive[2] * shading.emissiveMix
      )
    }
  })

  return (
    <>
      <IntroSceneLights reveal={reveal} />
      <group ref={placer} visible={false}>
        <group ref={tilt}>
          <group rotation={SVG_FLIP}>
            {geometries.map((geometry, index) => (
              <mesh key={index} castShadow geometry={geometry}>
                <meshStandardMaterial
                  ref={(node) => {
                    if (node) materialsRef.current[index] = node
                  }}
                  color={INK_COLOR}
                  roughness={INK_ROUGHNESS}
                  metalness={0}
                  side={THREE.DoubleSide}
                  transparent
                  opacity={0}
                />
              </mesh>
            ))}
          </group>
        </group>
      </group>
      <IntroShadowPlane reveal={reveal} meshOpacity={opacity} />
    </>
  )
}

export default function IntroLogoCanvas(props: IntroLogoCanvasProps) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 2000], zoom: 1, near: 1, far: 6000 }}
      dpr={[1, 1.5]}
      // `PCFShadowMap` explícito y NO el `PCFSoftShadowMap` que r3f pone con
      // `shadows` en `true`: en three 0.18x el "soft" compila como BASIC, una
      // sola muestra sin filtrar. La cita del código de three está en el
      // `SHADOW_RADIUS` del probe.
      shadows={{ type: THREE.PCFShadowMap }}
      gl={{
        alpha: true,
        antialias: true,
        // El MISMO operador del probe, y no el ACES que r3f pone por default: el
        // mismo material con la misma luz tiene que dar el mismo valor en las dos
        // pantallas. Y es sobre este operador que `introShading.ts` resuelve la
        // emisiva para que la tinta plana caiga en el color exacto del SVG.
        toneMapping: THREE.NeutralToneMapping,
        toneMappingExposure: 1,
      }}
      style={{ pointerEvents: 'none' }}
    >
      <IntroLogoMesh {...props} />
    </Canvas>
  )
}
