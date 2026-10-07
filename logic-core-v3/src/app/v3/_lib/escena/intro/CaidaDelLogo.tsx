'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import type * as THREE from 'three'

import { cargaLista } from '../../carga'
import { TITULOS_DE_VOLUMEN } from '../../titulos3d/registro'
import { IDS_DEL_TITULAR_DEL_HERO, TITULAR_EN_VIVO } from '../../titulos3d/titular'
import { entornoDeLaEscena, hayBanco } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { FINAL_EN_EL_PISO } from '../final/enElPiso'
import { CAIDA_DEL_LOGO, altoDesdeElBorde, alturaDeLaCaida, pasoDeLaBajada } from './caida'

/**
 * [NOCTURNO FINAL] B1 · el logo cae al cargar (`caida.ts`). Va justo después del rig, antes que todo lo que lee la
 * altura del logo (la mancha, la sombra, el aire). Se decide al montarse: si la página cargó con el hero a la vista, el logo
 * arranca arriba; si no, ya está en su lugar y esto no hace nada. Al llegar, la súper onda (el golpe del piso, en el logo).
 *
 * [PULIDO 1] P6 · baja a velocidad constante con la llegada del titular (`pasoDeLaBajada`): arranca con su primera letra y
 * llega con la última. Al arrancar, mide desde dónde: apenas arriba del borde de arriba del cuadro, así se ve desde el
 * primer instante (antes esperaba fuera del cuadro y aparecía tarde).
 */
type VentanaDelBanco = Window & { __caidaDelBanco?: () => { u: number; propio: boolean; alto: number; y: number; titular: { llegada: number; armado: boolean; enCamino: boolean } } }

/** Lo que `pasoDeLaBajada` lee en cada cuadro: un objeto, escrito en el lugar (cero reservas por cuadro). */
const FUENTE = { conTitular: false, titular: TITULAR_EN_VIVO, cargaLista: false, vencido: false }

export function CaidaDelLogo({ logoGroupRef }: { readonly logoGroupRef: RefObject<THREE.Group | null> }) {
  // `u`: lo bajado (0 a 1); negativo, sin caída. `propio`: va con su reloj (sin titular). `alto`: desde dónde baja (u).
  // `esperaS`: cuánto lleva esperando al titular anotado, con la carga abierta.
  const m = useRef({ u: -1, propio: false, alto: CAIDA_DEL_LOGO.alto as number, medido: false, esperaS: 0 })
  const asentado = entornoDeLaEscena().pruebas.angel === 'asentado'

  useLayoutEffect(() => {
    const logo = logoGroupRef.current
    const estado = m.current
    if (logo === null || window.scrollY >= window.innerHeight * CAIDA_DEL_LOGO.arriba) return undefined
    estado.u = 0
    estado.propio = false
    estado.medido = false
    estado.esperaS = 0
    logo.position.y = CAIDA_DEL_LOGO.alto
    return () => {
      if (estado.u < 0) return
      estado.u = -1
      logo.position.y = 0
    }
  }, [logoGroupRef])

  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    ventana.__caidaDelBanco = () => ({ u: m.current.u, propio: m.current.propio, alto: m.current.alto, y: logoGroupRef.current?.position.y ?? Number.NaN, titular: { ...TITULAR_EN_VIVO } })
    return () => {
      delete ventana.__caidaDelBanco
    }
  }, [logoGroupRef])

  useFrame((state, delta) => {
    const s = m.current
    const logo = logoGroupRef.current
    if (logo === null || s.u < 0) return
    const antes = s.u
    const dt = Math.min(Math.max(delta, 0), 0.1)
    FUENTE.conTitular = TITULOS_DE_VOLUMEN.has(IDS_DEL_TITULAR_DEL_HERO[0])
    FUENTE.cargaLista = cargaLista()
    if (FUENTE.cargaLista && FUENTE.conTitular && !TITULAR_EN_VIVO.armado) s.esperaS += dt
    FUENTE.vencido = s.esperaS > CAIDA_DEL_LOGO.esperaMaximaS
    pasoDeLaBajada(s, FUENTE, dt)
    if (antes === 0 && s.u > 0 && !s.medido) {
      s.alto = altoDesdeElBorde(state.camera, logo)
      s.medido = true
    }
    logo.position.y = s.u > 0 ? alturaDeLaCaida(s.u, s.alto, asentado) : CAIDA_DEL_LOGO.alto
    if (s.u < 1) return
    s.u = -1
    // La súper onda: el golpe del piso, desde el logo.
    FINAL_EN_EL_PISO.uGolpe.value.set(VIVO.uTiempo.value, logo.position.x, logo.position.z, 1)
  })

  return null
}
