'use client'

import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useRef, type RefObject } from 'react'
import type * as THREE from 'three'

import { cargaLista } from '../../carga'
import { VIVO } from '../entorno/vivo'
import { FINAL_EN_EL_PISO } from '../final/enElPiso'
import { CAIDA_DEL_LOGO, alturaDeLaCaida } from './caida'

/**
 * [NOCTURNO FINAL] B1 · el logo cae al cargar (`caida.ts`). Va justo después del rig, antes que todo lo que lee la
 * altura del logo (la mancha, la sombra, el aire). Se decide al montarse: si la página cargó con el hero a la vista, el logo
 * arranca arriba; si no, ya está en su lugar y esto no hace nada. Al llegar, la súper onda (el golpe del piso, en el logo).
 */
export function CaidaDelLogo({ logoGroupRef }: { readonly logoGroupRef: RefObject<THREE.Group | null> }) {
  // `u`: lo armado (0 a 1); negativo, sin caída.
  const m = useRef({ u: -1 })

  useLayoutEffect(() => {
    const logo = logoGroupRef.current
    const estado = m.current
    if (logo === null || window.scrollY >= window.innerHeight * CAIDA_DEL_LOGO.arriba) return undefined
    estado.u = 0
    logo.position.y = alturaDeLaCaida(0)
    return () => {
      if (estado.u < 0) return
      estado.u = -1
      logo.position.y = 0
    }
  }, [logoGroupRef])

  useFrame((_, delta) => {
    const s = m.current
    const logo = logoGroupRef.current
    if (logo === null || s.u < 0) return
    if (cargaLista()) s.u = Math.min(1, s.u + Math.min(Math.max(delta, 0), 0.1) / CAIDA_DEL_LOGO.duracionS)
    logo.position.y = alturaDeLaCaida(s.u)
    if (s.u < 1) return
    s.u = -1
    // La súper onda: el golpe del piso, desde el logo.
    FINAL_EN_EL_PISO.uGolpe.value.set(VIVO.uTiempo.value, logo.position.x, logo.position.z, 1)
  })

  return null
}
