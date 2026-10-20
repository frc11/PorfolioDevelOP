'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

import { FLOOR_Y } from '../probeScene'

import { COMPOSICION_DE_LA_LUZ, SALIDA_DE_LA_VARIANTE_MS, type PropsDeLaVariante } from './variante'

/** Hasta dónde del avance se enciende (de ahí a 1, quieta: el título se lee sobre ella). */
const ENCENDIDA_HASTA = 0.5
const suave = (t: number): number => t * t * (3 - 2 * t)
const BLANCO = new THREE.Color(1, 1, 1)

/**
 * [B12a.3] LA VARIANTE DE PRUEBA — la de `/v3/prueba-de-pagina` (registro: `prueba`). Ejerce la ranura entera con lo que una variante puede
 * hacer, y nada más:
 * · agrega un objeto a la escena (un anillo de luz en el piso, alrededor del logo, del color del acento) y lo anima en su `useFrame`;
 * · enciende la luz de abajo prestada (de la composición a la entera) y la tiñe del acento, y tiñe la energía (P-H29a, b y c);
 * · al salir (P-H29d) vuelve a la composición en `SALIDA_DE_LA_VARIANTE_MS`, rápida y calma; con movimiento reducido, quieta y de una;
 * · lo que crea lo crea R3F (el JSX), que lo libera al desmontarse.
 */
export default function VarianteDePrueba({ avance, acento, calidad, reducido, luzDeAbajo, energia, saliendo }: PropsDeLaVariante): React.JSX.Element {
  const anillo = useRef<THREE.Mesh>(null)
  const material = useRef<THREE.MeshBasicMaterial>(null)
  const color = useRef(new THREE.Color(1, 1, 1))
  const salida = useRef<{ readonly desde: number; readonly t0: number } | null>(null)

  useFrame(() => {
    const avanceAhora = reducido ? 1 : suave(Math.min(1, Math.max(0, avance.current / ENCENDIDA_HASTA)))
    let t = avanceAhora
    if (saliendo.current) {
      const s = salida.current ?? { desde: avanceAhora, t0: performance.now() }
      salida.current = s
      const k = reducido ? 1 : Math.min(1, (performance.now() - s.t0) / SALIDA_DE_LA_VARIANTE_MS)
      t = s.desde * (1 - k) ** 3
    } else salida.current = null
    color.current.copy(BLANCO).lerp(acento, t)
    luzDeAbajo(COMPOSICION_DE_LA_LUZ.brilloDelPiso + (1 - COMPOSICION_DE_LA_LUZ.brilloDelPiso) * t, color.current)
    energia(color.current)
    if (material.current !== null) material.current.opacity = 0.85 * t
    anillo.current?.scale.setScalar(0.7 + 0.3 * t)
  })

  return (
    <mesh ref={anillo} rotation-x={-Math.PI / 2} position-y={FLOOR_Y + 0.02}>
      <ringGeometry args={[3.2, 3.45, calidad === 'compacta' ? 64 : 128]} />
      <meshBasicMaterial ref={material} color={acento} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}
