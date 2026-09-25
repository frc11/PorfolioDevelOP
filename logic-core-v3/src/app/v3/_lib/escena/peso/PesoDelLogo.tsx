'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'

import { entornoDeLaEscena } from '../entorno'
import type { ProbeRigStore } from '../probeStore'
import { fueraDelTunel } from '../tunelEnLaEscena'
import { viajeEnCurso } from '../viaje'
import { avanzarElPeso, pesoInicial, type EstadoDelPeso } from './resortes'
import { crearPuntero, type PunteroVivo } from './puntero'

/**
 * [ESCENA 4] EL LOGO CON PESO — escribe los resortes de `resortes.ts` en un grupo PROPIO, adentro
 * del que balancea la vira (`pesoRef`, en `ProbeStage`): no pisa la pose, se le suma, y en reposo el
 * grupo queda en la identidad. La sombra lo acompaña sola: `ContactOcclusion` mide la caja del logo
 * entero, con este grupo adentro.
 *
 * Apagado en táctil (no hay cursor que seguir), con movimiento reducido, en el túnel de Trabajos y
 * durante un viaje del navbar: ahí el resorte vuelve a cero en vez de cortar de golpe.
 */

interface PropsDelPeso {
  readonly rig: ProbeRigStore
  readonly pesoRef: RefObject<THREE.Group | null>
  readonly quieto: boolean
}

export function PesoDelLogo(props: PropsDelPeso) {
  if (!entornoDeLaEscena().escena4.peso) return null
  return <PesoPrendido {...props} />
}

interface Memoria {
  puntero: PunteroVivo | null
  estado: EstadoDelPeso | null
  readonly q: THREE.Quaternion
  readonly cabeceo: THREE.Quaternion
  readonly derecha: THREE.Vector3
  readonly arriba: THREE.Vector3
}

function PesoPrendido({ rig, pesoRef, quieto }: PropsDelPeso) {
  const memoria = useRef<Memoria>({ puntero: null, estado: null, q: new THREE.Quaternion(), cabeceo: new THREE.Quaternion(), derecha: new THREE.Vector3(), arriba: new THREE.Vector3(0, 1, 0) })

  useEffect(() => {
    const m = memoria.current
    const puntero = crearPuntero()
    m.puntero = puntero
    return () => {
      puntero.soltar()
      m.puntero = null
    }
  }, [])

  useFrame((state, delta) => {
    const grupo = pesoRef.current
    const m = memoria.current
    if (grupo === null || m.puntero === null) return
    const progreso = rig.current.progress
    const p = m.puntero.leer()
    const apagado = quieto || !p.fino || viajeEnCurso() !== null || fueraDelTunel(progreso) < 1
    const e = avanzarElPeso(m.estado ?? pesoInicial(progreso), { dt: delta, progreso, cursor: p.adentro ? { x: p.x, y: p.y } : null, apagado })
    m.estado = e
    escribirElPeso(grupo, e, state.camera, m)
  })

  return null
}

/** El giro hacia el cursor alrededor de la vertical y del eje derecho de la cámara, más la bajada. */
function escribirElPeso(grupo: THREE.Group, e: EstadoDelPeso, camara: THREE.Camera, m: Memoria): void {
  m.derecha.set(1, 0, 0).applyQuaternion(camara.quaternion)
  m.derecha.y = 0
  if (m.derecha.lengthSq() < 1e-6) m.derecha.set(1, 0, 0)
  m.derecha.normalize()
  // Cursor arriba → la cara sube hacia él; el cabeceo del scroll se suma en el mismo eje.
  m.cabeceo.setFromAxisAngle(m.derecha, -e.arriba.x + e.cabeceo.x)
  m.q.setFromAxisAngle(m.arriba, e.costado.x).multiply(m.cabeceo)
  grupo.quaternion.copy(m.q)
  grupo.position.set(0, e.bajada.x, 0)
}
