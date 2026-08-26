'use client'

import { useFrame, useThree } from '@react-three/fiber'
import type { MotionValue } from 'motion/react'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import {
  FILL_AZIMUTH_DEG,
  FILL_ELEVATION_DEG,
  KEY_AZIMUTH_DEG,
  KEY_ELEVATION_DEG,
} from '@/app/probe-escena/_components/probeLighting'
import { BOUNCE_COLOR, PAPER_COLOR } from '@/app/probe-escena/_components/probeScene'

import { sampleInkShading } from './introRig'

/**
 * EL RIG DE LA ESCENA, ENTRANDO DURANTE EL ACOMODAMIENTO.
 *
 * Las tres intensidades son **las de la escena** (`probeLighting.ts`), no
 * inventadas acá: cuando el logo termina de acomodarse tiene que estar
 * iluminado como va a estarlo un segundo después.
 *
 * Falta el contraluz, y es a propósito: en la escena el rim es solidario a la
 * CÁMARA y necesita la órbita para tener sentido. Acá la cámara no se mueve.
 * Queda anotado como la diferencia conocida entre el logo que aterriza y el que
 * la escena va a mostrar.
 *
 * ── Siempre montadas, nunca desmontadas ────────────────────────────────────
 *
 * Las luces existen desde el primer frame con intensidad 0. Montarlas y
 * desmontarlas cambiaría la cantidad de luces de la escena y **recompilaría el
 * shader a mitad del gesto final**, que es un tirón justo donde no se puede.
 * En `reveal` 0 las tres valen cero: por eso el logo se lee plano por
 * construcción y no por calibración (ver `introShading.ts`).
 */

/** Distancia de las luces al objeto, en píxeles de mundo. */
const LIGHT_DISTANCE = 4000
/** Igual que el probe: PCF común, el único que da un disco de muestreo. */
const SHADOW_MAP_SIZE = 1024
const SHADOW_RADIUS = 6

const DEG = Math.PI / 180

function lightPosition(azimuthDeg: number, elevationDeg: number): [number, number, number] {
  const azimuth = azimuthDeg * DEG
  const elevation = elevationDeg * DEG
  const horizontal = Math.cos(elevation) * LIGHT_DISTANCE
  return [
    Math.sin(azimuth) * horizontal,
    Math.sin(elevation) * LIGHT_DISTANCE,
    Math.cos(azimuth) * horizontal,
  ]
}

export function IntroSceneLights({ reveal }: { reveal: MotionValue<number> }) {
  const keyLight = useRef<THREE.DirectionalLight>(null)
  const fillLight = useRef<THREE.DirectionalLight>(null)
  const hemiLight = useRef<THREE.HemisphereLight>(null)
  const size = useThree((state) => state.size)

  const keyPosition = useMemo(() => lightPosition(KEY_AZIMUTH_DEG, KEY_ELEVATION_DEG), [])
  const fillPosition = useMemo(() => lightPosition(FILL_AZIMUTH_DEG, FILL_ELEVATION_DEG), [])

  /**
   * La cámara de sombra es ortográfica y en unidades de mundo, o sea píxeles:
   * tiene que cubrir la pantalla entera, porque el logo la recorre. r3f no llama
   * `updateProjectionMatrix` sobre cámaras de sombra, así que va a mano.
   */
  useEffect(() => {
    const light = keyLight.current
    if (!light) return
    const extent = Math.max(size.width, size.height)
    const camera = light.shadow.camera
    camera.left = -extent
    camera.right = extent
    camera.top = extent
    camera.bottom = -extent
    camera.near = Math.max(1, LIGHT_DISTANCE - extent * 2)
    camera.far = LIGHT_DISTANCE + extent * 2
    camera.updateProjectionMatrix()
  }, [size])

  useFrame(() => {
    const shading = sampleInkShading(reveal.get())
    if (keyLight.current) {
      keyLight.current.intensity = shading.keyIntensity
      // Sin luz no hay sombra que calcular: el mapa no se dibuja.
      keyLight.current.castShadow = shading.keyIntensity > 0
    }
    if (fillLight.current) fillLight.current.intensity = shading.fillIntensity
    if (hemiLight.current) hemiLight.current.intensity = shading.hemiIntensity
  })

  return (
    <>
      <hemisphereLight ref={hemiLight} args={[PAPER_COLOR, BOUNCE_COLOR]} intensity={0} />
      <directionalLight
        ref={keyLight}
        position={keyPosition}
        intensity={0}
        shadow-mapSize={[SHADOW_MAP_SIZE, SHADOW_MAP_SIZE]}
        shadow-radius={SHADOW_RADIUS}
      />
      <directionalLight ref={fillLight} position={fillPosition} intensity={0} />
    </>
  )
}
