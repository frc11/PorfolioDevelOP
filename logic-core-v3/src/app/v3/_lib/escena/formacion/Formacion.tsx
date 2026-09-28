'use client'

import { useFrame, useLoader } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { SVGLoader } from 'three-stdlib'
import type * as THREE from 'three'

import type { NivelDeCalidad } from '../calidad'
import { entornoDeLaEscena, hayBanco } from '../entorno'
import { PULSO_VIVO } from '../entorno/vivo'
import type { ProbeRigStore } from '../probeStore'
import type { Escenario } from '../StudioFloor'
import { fueraDelTunel } from '../tunelEnLaEscena'
import { armar, contarVisibles } from './armado'
import { FORMACION } from './enFormacion'
import type { UniformsDeLaCopia } from './materiales'

/**
 * [ESCENA 5] LA FORMACIÓN — las copias falladas afuera de la trama, alrededor del escenario y un
 * piso más abajo. Decoración de fondo: `enFormacion.ts` tiene el porqué de cada regla, `armado.ts`
 * lo que se construye y `materiales.ts` por qué casi no se ven.
 *
 * **El piso.** Con la formación, nuestro piso es un escenario de radio 45 y alrededor hay un piso
 * 1,6 más abajo, hasta el 64, donde recién arranca el ciclorama (`StudioFloor`, `pisoConFormacion`).
 * El desnivel no lleva ningún objeto: se lee porque el borde del escenario tapa el pie de las
 * primeras filas.
 *
 * **Dónde no está.** En el túnel de Trabajos (`tunelEnLaEscena.ts`), y en el teléfono, salvo
 * `movil=menos` (las dos primeras filas de cada bloque).
 */

interface PropsDeLaFormacion {
  readonly rig: ProbeRigStore
  readonly calidad: NivelDeCalidad
  readonly quieto: boolean
  readonly logoGroupRef: RefObject<THREE.Group | null>
}

type VentanaDelBanco = Window & {
  __formacionDelBanco?: {
    mostrar: (formacion: boolean, logo: boolean) => void
    visibles: () => number
    copias: number
    instancias: number
    triangulos: number
  }
}

/** ¿Hay formación en esta carga y en este ancho? */
function hayFormacion(calidad: NivelDeCalidad): boolean {
  const p = entornoDeLaEscena().pruebas
  return p.formacion && (calidad !== 'compacta' || p.movil === 'menos')
}

const ESCENARIO: Escenario = { radio: FORMACION.radioDelEscenario, desnivel: FORMACION.desnivel, hasta: FORMACION.radioDelPisoDeAbajo }

/** El escenario y el piso de abajo, si esta carga los pide (la formación o el relieve del piso). */
export function pisoConFormacion(calidad: NivelDeCalidad): Escenario | undefined {
  return hayFormacion(calidad) || entornoDeLaEscena().pruebas.relieve === 'R2' ? ESCENARIO : undefined
}

export function Formacion(props: PropsDeLaFormacion) {
  if (!hayFormacion(props.calidad)) return null
  return <FormacionPrendida {...props} />
}

function FormacionPrendida({ rig, calidad, quieto, logoGroupRef }: PropsDeLaFormacion) {
  const svg = useLoader(SVGLoader, '/logodevelOP.svg')
  const movil = calidad === 'compacta'
  const { mirada, relieve } = entornoDeLaEscena().pruebas
  const armado = useMemo(() => armar(svg.paths.flatMap((p) => p.toShapes(true)), movil, relieve === 'R2'), [svg, movil, relieve])
  useEffect(() => () => armado.soltar(), [armado])
  const memoria = useRef({ camara: null as THREE.Camera | null, mirada: 0 })

  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    ventana.__formacionDelBanco = {
      mostrar: (conFormacion, conLogo) => {
        armado.instancias.visible = conFormacion
        if (logoGroupRef.current !== null) logoGroupRef.current.visible = conLogo
      },
      visibles: () => (memoria.current.camara === null ? 0 : contarVisibles(armado.copias, memoria.current.camara)),
      copias: armado.copias.length,
      instancias: armado.instancias.count,
      triangulos: armado.instancias.count * armado.triangulosPorPieza,
    }
    return () => {
      delete ventana.__formacionDelBanco
    }
  }, [armado, logoGroupRef])

  useFrame((state, delta) => {
    const m = memoria.current
    m.camara = state.camera
    m.mirada = siguienteMirada(m.mirada, mirada && !quieto && PULSO_VIVO.hover, Math.min(delta, 0.1))
    alCuadro(armado.copia, fueraDelTunel(rig.current.progress), m.mirada)
  })

  return <primitive object={armado.instancias} />
}

function alCuadro(u: UniformsDeLaCopia, visible: number, mirada: number): void {
  u.uVisible.value = visible
  u.uMirada.value = mirada
}

/** F-mirada: 0 → 1 en ~2,5 s al entrar el hover, y de vuelta al salir. */
function siguienteMirada(actual: number, hover: boolean, dt: number): number {
  const objetivo = hover ? 1 : 0
  const paso = dt / 2.5
  return objetivo > actual ? Math.min(objetivo, actual + paso) : Math.max(objetivo, actual - paso)
}
