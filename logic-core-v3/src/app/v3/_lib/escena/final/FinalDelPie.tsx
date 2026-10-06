'use client'

import { useFrame, useLoader } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from 'react'
import { SVGLoader } from 'three-stdlib'
import * as THREE from 'three'

import { hayBanco } from '../entorno'
import { PROBE_EXTRUDE, PROBE_SVG_SCALE } from '../probeScene'
import type { ProbeStatsStore } from '../probeStore'
import { alCuadroDelFinal, crearElEstado, soltarElFinal, type EstadoDelFinal } from './cuadroDelFinal'
import { FINAL_EN_EL_PISO } from './enElPiso'
import { formasDelLogo, mascaraDelLogo } from './hueco'
import { EN_VIVO } from './recorridoDelFinal'

/**
 * [CIERRE] 3 · EL FINAL DEL PIE EN LA ESCENA — va justo después del rig (`OrbitRig` pone la cámara del recorrido en la pose
 * E y el balanceo del logo; acá se les suma el final, en el mismo cuadro y antes que todo lo que los lee: el piso, el aire,
 * los títulos, las piezas del pie). Desde 1024 y con movimiento (`ProbeStage`). Lo que hace y el porqué, en `recorridoDelFinal.ts`.
 *
 * [EL ENCASTRE] · el componente arma lo de una vez (las formas del logo, la máscara del hueco y el pozo) y en cada cuadro
 * llama a `alCuadroDelFinal` (`cuadroDelFinal.ts`). [RETOQUE DEL ENCASTRE] 1A · sin el vapor: se abre el hueco y el logo encaja.
 */
interface Props {
  readonly logoGroupRef: RefObject<THREE.Group | null>
  readonly stats: ProbeStatsStore
}

type VentanaDelBanco = Window & { __finalDelBanco?: () => { fin: number; camara: number; giro: number; aleja: number; golpes: number; logo: number[]; apertura: number } }

/** El espesor del logo (u): la extrusión y sus dos biseles, en la escala del SVG (el mismo que publica `ProbeLogo`). */
const ESPESOR_DEL_LOGO = (PROBE_EXTRUDE.depth + 2 * PROBE_EXTRUDE.bevelThickness) * PROBE_SVG_SCALE

export function FinalDelPie({ logoGroupRef, stats }: Props) {
  const svg = useLoader(SVGLoader, '/logodevelOP.svg')
  const logo = useMemo(() => formasDelLogo(svg), [svg])
  const grupo = useRef<THREE.Group>(null)
  const m = useRef<EstadoDelFinal | null>(null)

  // Se arma al montarse (el pozo, al grupo; la máscara, al piso); al irse (abajo de 1024, o con movimiento reducido), todo
  // como estaba.
  useLayoutEffect(() => {
    const g = grupo.current
    const grupoDelLogo = logoGroupRef.current
    if (g === null) return undefined
    const estado = crearElEstado(logo.formas, ESPESOR_DEL_LOGO)
    const mascara = mascaraDelLogo(logo.formas, logo.caja)
    const piso = FINAL_EN_EL_PISO
    piso.uHueco.value = mascara.textura
    piso.uMarcoDelHueco.value.copy(mascara.marco)
    logo.caja.getSize(piso.uCajaDelLogo.value).multiplyScalar(0.5)
    m.current = estado
    g.add(estado.pozo.grupo)
    return () => {
      g.remove(estado.pozo.grupo)
      soltarElFinal(estado, grupoDelLogo)
      EN_VIVO.fin = 0
      EN_VIVO.pegadoDesde = Number.POSITIVE_INFINITY
      piso.uGolpe.value.w = 0
      piso.uHueco.value = null
      estado.pozo.soltar()
      mascara.textura.dispose()
      m.current = null
    }
  }, [logo, logoGroupRef])

  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    ventana.__finalDelBanco = () => ({ fin: EN_VIVO.fin, camara: EN_VIVO.camara, giro: EN_VIVO.giro, aleja: EN_VIVO.aleja, golpes: m.current?.golpes ?? 0, logo: logoGroupRef.current ? [...logoGroupRef.current.position.toArray(), logoGroupRef.current.rotation.x] : [], apertura: FINAL_EN_EL_PISO.uApertura.value })
    return () => {
      delete ventana.__finalDelBanco
    }
  }, [logoGroupRef])

  useFrame((state, delta) => {
    if (m.current !== null) alCuadroDelFinal(m.current, state, delta, logoGroupRef.current, { alto: stats.current.logoH || 4.78, espesor: stats.current.logoD || ESPESOR_DEL_LOGO })
  })

  return <group ref={grupo} name="final del pie" />
}
