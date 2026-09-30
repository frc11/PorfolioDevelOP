'use client'

import { useFrame, useLoader } from '@react-three/fiber'
import { useMemo, useRef, type RefObject } from 'react'
import { SVGLoader } from 'three-stdlib'
import * as THREE from 'three'

import { DUST_SPIN_DEG_S } from '../choreographyPhysics'
import { entornoDeLaEscena, hayBanco } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { PROBE_SVG_SCALE } from '../probeScene'
import type { ProbeRigStore } from '../probeStore'
import { HAZ_ENCENDIDO } from '../entorno/encendido'
import { MOTAS } from './motas'
import { formaDelLogo, type FormaDelLogo } from './formaDelLogo'
import { AIRE } from './parche'

/**
 * [ESCENA 5] EL AIRE — escribe, después del rig y del entorno, los uniforms del polvo (`parche.ts`):
 * la forma y la pose del logo, el freno del haz (5d) y [ESCENA 6] el corrimiento de 6a. La
 * quietud y el despertar se mudaron a la física (`Fisica.tsx`). Sin ninguno no se monta. No mueve la
 * cámara ni el logo: los lee. [ESCENA 9] T1: la forma ya no es un obstáculo del polvo; la leen el piso
 * vivo y la fugaz, y la pose, el polvo posado sobre el logo.
 */

interface PropsDelAire {
  readonly rig: ProbeRigStore
  readonly quieto: boolean
  readonly logoGroupRef: RefObject<THREE.Group | null>
}

type VentanaDelBanco = Window & { __aireDelBanco?: { viento: number; motas: number; deriva: number[]; aire: number[] } }

/**
 * [ESCENA 6] 6a · el aire: qué parte de la velocidad de la cámara toma mientras hay scroll, en cuánto
 * la toma y en cuánto la pierde después (s).
 */
export const INERCIA = { arrastre: 0.25, tomaS: 0.4, frenaS: 2.2 } as const

/** 6a: el corrimiento de todo el volumen avanza con el aire. */
function derivar(aire: THREE.Vector3, dt: number): void {
  AIRE.uDeriva.value.addScaledVector(aire, dt)
}

const RAD_POR_S = DUST_SPIN_DEG_S.map((g) => (g * Math.PI) / 180)

export function Aire(props: PropsDelAire) {
  return <AireConElLogo {...props} />
}

/** Hace falta el SVG para saber dónde está el centro del trazo (el de `ProbeLogo`). */
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
    progreso: Number.NaN,
    camara: new THREE.Vector3(),
    camaraAntes: new THREE.Vector3(),
    empuje: new THREE.Vector3(),
    aire: new THREE.Vector3(),
  })

  useFrame((state, delta) => {
    const m = memoria.current
    const dt = Math.min(delta, 0.1)

    // La forma y la pose del logo (para el piso vivo, la fugaz y el polvo posado).
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

    // [ESCENA 6] 6a · la inercia del aire: mientras el scroll mueve la cámara, el aire la acompaña un
    // poco; cuando frena, sigue derivando hacia donde iba y se frena despacio.
    if (e.inercia) {
      const progreso = rig.current.progress
      const conScroll = !Number.isNaN(m.progreso) && Math.abs(progreso - m.progreso) > 1e-6
      m.progreso = progreso
      if (!quieto && conScroll && dt > 0) m.empuje.copy(state.camera.position).sub(m.camaraAntes).divideScalar(dt).multiplyScalar(INERCIA.arrastre)
      else m.empuje.set(0, 0, 0)
      const tau = m.empuje.lengthSq() > 0 ? INERCIA.tomaS : INERCIA.frenaS
      m.aire.lerp(m.empuje, 1 - Math.exp(-dt / tau))
      derivar(m.aire, dt)
    }
    // [ESCENA 7] T7: el aire que corre, para la física: lleva a las motas levantadas ([ESCENA 9] T1: ya no rodea al logo).
    AIRE.uVientoDelAire.value.copy(m.aire)
    // [ESCENA 7] T10: el lado nítido de la mota se cuenta en píxeles CSS.
    AIRE.uPixel.value = state.viewport.dpr
    m.camaraAntes.copy(state.camera.position)

    // 5d · de noche, lo que el haz le quita al giro de cada concha, acumulado.
    if (e.motas) {
      // [ESCENA 6] Con 6e, las motas siguen al encendido del haz. [ESCENA 7] El freno llega a lo sumo al
      // de siempre (el haz prendido pasa de 1 y las motas girarían para atrás); el destello sí sube con él.
      const noche = Math.min(1, VIVO.uNoche.value * HAZ_ENCENDIDO.k)
      AIRE.uMotas.value = noche
      AIRE.uBrilloDeLasMotas.value = Math.max(1, HAZ_ENCENDIDO.k)
      if (!quieto) for (let i = 0; i < 3; i += 1) AIRE.uContraGiro.value[i] += RAD_POR_S[Math.min(i, RAD_POR_S.length - 1)] * MOTAS.frenoEnElHaz * noche * dt
    }

    if (hayBanco()) (window as VentanaDelBanco).__aireDelBanco = { viento: AIRE.uVientoDelAire.value.length(), motas: AIRE.uMotas.value, deriva: AIRE.uDeriva.value.toArray(), aire: m.aire.toArray() }
  })

  return null
}
