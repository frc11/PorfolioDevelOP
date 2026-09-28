'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

import { entornoDeLaEscena, hayBanco } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { AIRE } from '../polvo/parche'
import type { ProbeRigStore } from '../probeStore'

/**
 * [ESCENA 7] T13 · EL ENFOQUE QUE BUSCA — con bandera, apagado. Al frenar el scroll el foco duda un instante y
 * se clava en el logo, como el autofoco de una cámara. Sutil.
 *
 * La escena no tiene una pasada de desenfoque (no hay EffectComposer): lo que se desenfoca es el POLVO, que
 * ya sabe desenfocarse (T10). Cuando el scroll frena, el foco sale un poco por delante y por detrás del logo
 * (dos o tres vaivenes que se apagan) y queda en la distancia del logo; mientras busca, cada mota se
 * desenfoca según qué tan lejos está del foco (`ENFOQUE` en `polvo/nitidez.ts`), y cuando se clava el polvo
 * vuelve a estar nítido. El logo no se desenfoca nunca: es a lo que el foco va.
 */
export const BUSCA = {
  /** Cuánto duró el scroll para que el frenazo cuente (s) y cuánto espera después (s). */
  scroll: 0.3,
  espera: 0.08,
  /** Cuánto se pasa el foco (fracción de la distancia al logo), cada cuánto va y viene (s), y en cuánto se apaga (s). */
  pasa: 0.45,
  periodo: 0.3,
  apaga: 0.2,
  /** En cuánto se va el desenfoque del polvo (s). */
  clava: 0.38,
} as const

type VentanaDelBanco = Window & { __enfoqueDelBanco?: { ya: () => void; estado: () => number[] } }

interface PropsDelEnfoque {
  readonly rig: ProbeRigStore
}

export function Enfoque(props: PropsDelEnfoque) {
  const e = entornoDeLaEscena()
  if (!e.pruebas.enfoque || !e.nitidez) return null
  return <EnfoquePrendido {...props} />
}

function EnfoquePrendido({ rig }: PropsDelEnfoque) {
  const memoria = useRef({ progreso: Number.NaN, desde: Number.NaN, scrollDesde: Number.NaN, frena: Number.NaN, logo: new THREE.Vector3() })

  useFrame((state) => {
    const m = memoria.current
    const t = VIVO.uTiempo.value
    const progreso = rig.current.progress
    const mueve = !Number.isNaN(m.progreso) && Math.abs(progreso - m.progreso) > 1e-6
    m.progreso = progreso
    if (mueve) {
      if (Number.isNaN(m.scrollDesde)) m.scrollDesde = t
      m.desde = Number.NaN
    } else if (!Number.isNaN(m.scrollDesde)) {
      // Frenó: si el scroll duró lo suficiente, el foco busca.
      if (t - m.scrollDesde > BUSCA.scroll) m.frena = t
      m.scrollDesde = Number.NaN
    }
    if (!Number.isNaN(m.frena) && t - m.frena > BUSCA.espera) {
      m.desde = t
      m.frena = Number.NaN
    }
    const alLogo = state.camera.position.distanceTo(m.logo)
    if (Number.isNaN(m.desde)) {
      buscar(0, alLogo)
      if (hayBanco()) publicar(m)
      return
    }
    const s = t - m.desde
    buscar(Math.exp(-s / BUSCA.clava), alLogo * (1 + BUSCA.pasa * Math.exp(-s / BUSCA.apaga) * Math.cos((2 * Math.PI * s) / BUSCA.periodo)))
    if (hayBanco()) publicar(m)
  })

  return null
}

function buscar(cuanto: number, foco: number): void {
  AIRE.uBusca.value = cuanto
  AIRE.uFoco.value = foco
}

function publicar(m: { desde: number; frena: number }): void {
  ;(window as VentanaDelBanco).__enfoqueDelBanco = {
    ya: () => {
      m.desde = VIVO.uTiempo.value
    },
    estado: () => [AIRE.uBusca.value, AIRE.uFoco.value],
  }
}
