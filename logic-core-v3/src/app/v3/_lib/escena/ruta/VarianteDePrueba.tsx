'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

import { FLOOR_Y } from '../probeScene'

import { COMPOSICION_DE_LA_LUZ, SALIDA_DE_LA_VARIANTE_MS, type PropsDeLaVariante } from './variante'

/** Hasta dónde del avance se abre el anillo (de ahí a 1, quieto: el título se lee sobre él). */
const ENCENDIDA_HASTA = 0.5
const suave = (t: number): number => t * t * (3 - 2 * t)
const BLANCO = new THREE.Color(1, 1, 1)

/** Una salida en curso: de qué encendido arrancó y cuándo (ms de `performance.now()`). */
export type SalidaDeLaPrueba = { readonly desde: number; readonly t0: number }

/** Lo que la variante pone en un cuadro: el encendido (0, la composición; 1, encendida), la escala del anillo y la salida que sigue. */
export interface CuadroDeLaPrueba {
  readonly encendido: number
  readonly brilloDelPiso: number
  readonly escala: number
  readonly salida: SalidaDeLaPrueba | null
}

/**
 * [T0 · 2026-10-22] 11 · 1 · EL COLOR DE LA PÁGINA DESDE EL ARRANQUE (pedido de Valentino): la luz de abajo, el acento en la luz y en la
 * energía y el anillo ya están encendidos en el avance 0, en la composición inicial (antes se encendían con el scroll, de 0 a la mitad de la
 * intro: entrando, la página arrancaba en blanco y había que scrollear un poco para verla de noche y con su acento). El scroll mueve sólo el
 * gesto: el anillo se abre (del 85 al 100 % de su tamaño) hasta la mitad de la intro. Al irse, la salida de siempre: de lo encendido a la
 * composición en `SALIDA_DE_LA_VARIANTE_MS`, rápida y calma. Puro: lo prueba s78-t0.
 */
export function cuadroDeLaPrueba(avance: number, reducido: boolean, saliendo: boolean, ahora: number, salida: SalidaDeLaPrueba | null): CuadroDeLaPrueba {
  const apertura = 0.85 + 0.15 * (reducido ? 1 : suave(Math.min(1, Math.max(0, avance / ENCENDIDA_HASTA))))
  let encendido = 1
  let sigue: SalidaDeLaPrueba | null = null
  if (saliendo) {
    sigue = salida ?? { desde: encendido, t0: ahora }
    const k = reducido ? 1 : Math.min(1, (ahora - sigue.t0) / SALIDA_DE_LA_VARIANTE_MS)
    encendido = sigue.desde * (1 - k) ** 3
  }
  return { encendido, brilloDelPiso: COMPOSICION_DE_LA_LUZ.brilloDelPiso + (1 - COMPOSICION_DE_LA_LUZ.brilloDelPiso) * encendido, escala: apertura * (0.7 + 0.3 * encendido), salida: sigue }
}

/**
 * [B12a.3] LA VARIANTE DE PRUEBA — la de ejemplo de la página base, `/v3/pagina-base` (registro: `prueba`). Ejerce la ranura entera con lo que una variante puede
 * hacer, y nada más:
 * · agrega un objeto a la escena (un anillo de luz en el piso, alrededor del logo, del color del acento) y lo anima en su `useFrame`;
 * · enciende la luz de abajo prestada (de la composición a la entera) y la tiñe del acento, y tiñe la energía (P-H29a, b y c); [T0] desde
 *   el primer cuadro (`cuadroDeLaPrueba`);
 * · al salir (P-H29d) vuelve a la composición en `SALIDA_DE_LA_VARIANTE_MS`, rápida y calma; con movimiento reducido, quieta y de una;
 * · lo que crea lo crea R3F (el JSX), que lo libera al desmontarse.
 */
export default function VarianteDePrueba({ avance, acento, calidad, reducido, luzDeAbajo, energia, saliendo }: PropsDeLaVariante): React.JSX.Element {
  const anillo = useRef<THREE.Mesh>(null)
  const material = useRef<THREE.MeshBasicMaterial>(null)
  const color = useRef(new THREE.Color(1, 1, 1))
  const salida = useRef<SalidaDeLaPrueba | null>(null)

  useFrame(() => {
    const c = cuadroDeLaPrueba(avance.current, reducido, saliendo.current, performance.now(), salida.current)
    salida.current = c.salida
    color.current.copy(BLANCO).lerp(acento, c.encendido)
    luzDeAbajo(c.brilloDelPiso, color.current)
    energia(color.current)
    if (material.current !== null) material.current.opacity = 0.85 * c.encendido
    anillo.current?.scale.setScalar(c.escala)
  })

  return (
    <mesh ref={anillo} rotation-x={-Math.PI / 2} position-y={FLOOR_Y + 0.02}>
      <ringGeometry args={[3.2, 3.45, calidad === 'compacta' ? 64 : 128]} />
      <meshBasicMaterial ref={material} color={acento} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}
