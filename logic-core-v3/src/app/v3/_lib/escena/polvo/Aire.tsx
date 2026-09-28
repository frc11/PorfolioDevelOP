'use client'

import { useFrame, useLoader } from '@react-three/fiber'
import { useMemo, useRef, type RefObject } from 'react'
import { SVGLoader } from 'three-stdlib'
import * as THREE from 'three'

import { DUST_SPIN_DEG_S } from '../choreographyPhysics'
import { entornoDeLaEscena, hayBanco } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { FLOOR_Y, PROBE_SVG_SCALE } from '../probeScene'
import type { ProbeRigStore } from '../probeStore'
import { MOTAS } from './motas'
import { formaDelLogo, type FormaDelLogo } from './obstaculo'
import { AIRE } from './parche'
import { avanzarElPolvo, polvoInicial, type EstadoDelPolvo } from './posarse'

/**
 * [ESCENA 5] EL AIRE — escribe, después del rig y del entorno, los uniforms de las pruebas del polvo
 * (`parche.ts`): la forma y la pose del logo (5a), la quietud y el despertar (5b) y el freno del haz
 * (5d). Sin ninguna prendida no se monta. No mueve la cámara ni el logo: los lee.
 */

interface PropsDelAire {
  readonly rig: ProbeRigStore
  readonly quieto: boolean
  readonly logoGroupRef: RefObject<THREE.Group | null>
}

type VentanaDelBanco = Window & { __aireDelBanco?: { quieto: number; desperto: number; abrir: number; motas: number } }

/** La holgura se abre con la estela de E6 (τ 0,11 s) y se cierra más lento, como el agua detrás de una piedra. */
const ABRE_TAU_S = 0.11
const CIERRA_TAU_S = 0.7
const RAD_POR_S = DUST_SPIN_DEG_S.map((g) => (g * Math.PI) / 180)

export function Aire(props: PropsDelAire) {
  const p = entornoDeLaEscena().pruebas
  if (!p.obstaculo && !p.posarse && !p.motas) return null
  return p.obstaculo ? <AireConElLogo {...props} /> : <AirePrendido {...props} />
}

/** Con 5a hace falta el SVG para saber dónde está el centro del trazo (el de `ProbeLogo`). */
function AireConElLogo(props: PropsDelAire) {
  const svg = useLoader(SVGLoader, '/logodevelOP.svg')
  const forma = useMemo(() => {
    const caja = new THREE.Box2()
    for (const f of svg.paths.flatMap((p) => p.toShapes(true))) for (const punto of f.extractPoints(12).shape) caja.expandByPoint(punto)
    const c = caja.getCenter(new THREE.Vector2())
    return formaDelLogo({ x: c.x, y: c.y }, PROBE_SVG_SCALE)
  }, [svg])
  return <AirePrendido {...props} forma={forma} />
}

function AirePrendido({ rig, quieto, logoGroupRef, forma }: PropsDelAire & { readonly forma?: FormaDelLogo }) {
  const e = entornoDeLaEscena()
  const memoria = useRef({
    polvo: null as EstadoDelPolvo | null,
    progreso: Number.NaN,
    puntero: new THREE.Vector2(9, 9),
    camara: new THREE.Vector3(),
    velocidad: 0,
    primera: true,
    rayo: new THREE.Raycaster(),
    plano: new THREE.Plane(new THREE.Vector3(0, 1, 0), -FLOOR_Y),
    punto: new THREE.Vector3(),
  })

  useFrame((state, delta) => {
    const m = memoria.current
    const dt = Math.min(delta, 0.1)
    const t = VIVO.uTiempo.value

    // 5a · la forma y la pose del logo, y cuánto se abre la holgura con la velocidad de la cámara.
    if (forma !== undefined) {
      AIRE.uLogoC.value.set(...forma.c)
      AIRE.uLogoP.value.set(...forma.p)
      AIRE.uLogoPalo.value.set(...forma.palo)
    }
    const logo = logoGroupRef.current
    if (logo !== null) {
      logo.updateMatrixWorld()
      AIRE.uLogo.value.copy(logo.matrixWorld)
      AIRE.uLogoInverso.value.copy(logo.matrixWorld).invert()
    }
    const velocidad = m.primera || dt <= 0 ? 0 : state.camera.position.distanceTo(m.camara) / dt
    m.camara.copy(state.camera.position)
    m.primera = false
    m.velocidad += (velocidad - m.velocidad) * (1 - Math.exp(-dt / (velocidad > m.velocidad ? ABRE_TAU_S : CIERRA_TAU_S)))
    AIRE.uAbrir.value = quieto ? 0 : Math.min(1, m.velocidad / 12)

    // 5b · la quietud: scroll o cursor despiertan, desde la cámara o desde el piso bajo el cursor.
    if (e.pruebas.posarse) {
      const progreso = rig.current.progress
      const scroll = !Number.isNaN(m.progreso) && Math.abs(progreso - m.progreso) > 1e-6
      const cursor = m.puntero.x < 5 && m.puntero.distanceToSquared(state.pointer) > 1e-8
      m.progreso = progreso
      m.puntero.copy(state.pointer)
      let origen: [number, number, number] | null = null
      if (cursor) {
        m.rayo.setFromCamera(state.pointer, state.camera)
        const toca = m.rayo.ray.intersectPlane(m.plano, m.punto)
        origen = toca !== null ? [toca.x, toca.y, toca.z] : [state.camera.position.x, FLOOR_Y, state.camera.position.z]
      } else if (scroll) {
        origen = [state.camera.position.x, FLOOR_Y, state.camera.position.z]
      }
      m.polvo = avanzarElPolvo(m.polvo ?? polvoInicial(t), t, origen, quieto)
      AIRE.uPolvoQuieto.value = m.polvo.quieto
      AIRE.uPolvoDesperto.value = m.polvo.desperto
      AIRE.uPolvoAntes.value = m.polvo.antes
      AIRE.uPolvoOrigen.value.set(...m.polvo.origen)
    }

    // 5d · de noche, lo que el haz le quita al giro de cada concha, acumulado.
    if (e.pruebas.motas) {
      const noche = VIVO.uNoche.value
      AIRE.uMotas.value = noche
      if (!quieto) for (let i = 0; i < 3; i += 1) AIRE.uContraGiro.value[i] += RAD_POR_S[Math.min(i, RAD_POR_S.length - 1)] * MOTAS.frenoEnElHaz * noche * dt
    }

    if (hayBanco()) (window as VentanaDelBanco).__aireDelBanco = { quieto: AIRE.uPolvoQuieto.value, desperto: AIRE.uPolvoDesperto.value, abrir: AIRE.uAbrir.value, motas: AIRE.uMotas.value }
  })

  return null
}
