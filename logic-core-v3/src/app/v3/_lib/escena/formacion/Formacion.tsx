'use client'

import { useFrame, useLoader } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { SVGLoader } from 'three-stdlib'
import * as THREE from 'three'

import type { NivelDeCalidad } from '../calidad'
import { entornoDeLaEscena, hayBanco } from '../entorno'
import type { ProbeRigStore } from '../probeStore'
import type { Escenario } from '../StudioFloor'
import { NIEBLA_DE_AFUERA } from '../niebla/rasante'
import { fueraDelTunel } from '../tunelEnLaEscena'
import { ESCENARIO, armar, contarVisibles } from './armado'
import type { UniformsDeLaCopia } from './materiales'

/**
 * [ESCENA 5] LA FORMACIÓN — las copias falladas afuera de la trama, alrededor del escenario y un
 * piso más abajo. Decoración de fondo: `enFormacion.ts` tiene el porqué de cada regla, `armado.ts`
 * lo que se construye y `materiales.ts` por qué casi no se ven.
 *
 * **El piso.** Con la formación, nuestro piso es un escenario de radio 45 y alrededor hay un piso
 * 1,6 más abajo que sube apenas hacia afuera, hasta el 72, donde recién arranca el ciclorama
 * (`StudioFloor`, `pisoConFormacion`). El desnivel no lleva ningún objeto: se lee porque el borde del
 * escenario tapa el pie de la primera fila.
 *
 * **Dónde no está.** En el túnel de Trabajos (`tunelEnLaEscena.ts`) ni en el teléfono.
 *
 * [ESCENA 6] Sin F-mirada: ahora todas miran al centro, así que no tenían hacia dónde girar.
 */

interface PropsDeLaFormacion {
  readonly rig: ProbeRigStore
  readonly calidad: NivelDeCalidad
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
  return entornoDeLaEscena().pruebas.formacion && calidad !== 'compacta'
}

/** El escenario y el piso de abajo, si esta carga tiene formación. */
export function pisoConFormacion(calidad: NivelDeCalidad): Escenario | undefined {
  return hayFormacion(calidad) ? ESCENARIO : undefined
}

export function Formacion(props: PropsDeLaFormacion) {
  if (!hayFormacion(props.calidad)) return null
  return <FormacionPrendida {...props} />
}

function FormacionPrendida({ rig, logoGroupRef }: PropsDeLaFormacion) {
  const svg = useLoader(SVGLoader, '/logodevelOP.svg')
  const { sinFallasVisibles, nieblaRasante, nieblaVelocidad } = entornoDeLaEscena().pruebas
  const armado = useMemo(() => armar(svg.paths.flatMap((p) => p.toShapes(true)), sinFallasVisibles, nieblaRasante), [svg, sinFallasVisibles, nieblaRasante])
  useEffect(() => () => armado.soltar(), [armado])
  const memoria = useRef({ camara: null as THREE.Camera | null, progreso: Number.NaN, antes: null as THREE.Vector3 | null, abre: 0 })

  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    ventana.__formacionDelBanco = {
      mostrar: (conFormacion, conLogo) => {
        for (const malla of armado.mallas) malla.visible = conFormacion
        if (logoGroupRef.current !== null) logoGroupRef.current.visible = conLogo
      },
      visibles: () => (memoria.current.camara === null ? 0 : contarVisibles(armado.copias, memoria.current.camara)),
      copias: armado.copias.length,
      instancias: armado.mallas.reduce((n, m) => n + m.count, 0),
      triangulos: armado.triangulos,
    }
    return () => {
      delete ventana.__formacionDelBanco
    }
  }, [armado, logoGroupRef])

  useFrame((state, delta) => {
    const m = memoria.current
    m.camara = state.camera
    alCuadro(armado.copia, fueraDelTunel(rig.current.progress))
    // [ESCENA 6] 6d: la velocidad de la cámara mientras el scroll la mueve, con la inercia de E6.
    if (nieblaVelocidad) {
      const dt = Math.min(Math.max(delta, 1e-3), 0.1)
      const progreso = rig.current.progress
      const conScroll = !Number.isNaN(m.progreso) && Math.abs(progreso - m.progreso) > 1e-6
      m.progreso = progreso
      const velocidad = conScroll && m.antes !== null ? state.camera.position.distanceTo(m.antes) / dt : 0
      m.antes = (m.antes ?? new THREE.Vector3()).copy(state.camera.position)
      const objetivo = Math.min(1, velocidad / ABRE_CON.plena)
      m.abre += (objetivo - m.abre) * (1 - Math.exp(-dt / (objetivo > m.abre ? ABRE_CON.subeS : ABRE_CON.bajaS)))
      abrir(m.abre)
    }
  })

  return (
    <>
      {armado.mallas.map((malla) => (
        <primitive key={malla.uuid} object={malla} />
      ))}
    </>
  )
}

/** 6d: a qué velocidad de la cámara la niebla está del todo abierta (u/s), y la inercia de E6 (s). */
const ABRE_CON = { plena: 12, subeS: 0.11, bajaS: 0.7 } as const

function abrir(abre: number): void {
  NIEBLA_DE_AFUERA.uAbre.value = abre
}

function alCuadro(u: UniformsDeLaCopia, visible: number): void {
  u.uVisible.value = visible
}
