'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'

import { entornoDeLaEscena, hayBanco } from '../entorno'
import { BRILLO_DE_LA_NOCHE } from '../particleGlow'
import type { ProbeRigStore } from '../probeStore'
import { leerCajasDeTexto } from './cajasDeTexto'
import { Haz } from './Haz'
import { crearHoverDelLogo, type HoverDelLogo } from './hoverDelLogo'
import { Pulso } from './Pulso'
import { PULSO, avanzarElPulso, pulsoInicial, type EstadoDelPulso } from './maquinaDelPulso'
import { NIVELES_DEL_CURSOR, NIVELES_DEL_HAZ, PULSO_VIVO, VIVO } from './vivo'

/**
 * [ESCENA 3] Monta las ideas prendidas y escribe `VIVO` una vez por cuadro.
 *
 * Va DESPUÉS de `<OrbitRig>` en el árbol: r3f corre los `useFrame` de igual prioridad en orden
 * de montaje, así que acá la cámara, la bruma y la noche de este cuadro ya están escritas. No
 * toca la cámara ni el arco: sólo los lee.
 */
const ESTELA_TAU_S = 0.11
const CURSOR_TAU_S = 0.05
const EMPUJE_SUBE_TAU_S = 0.08
const EMPUJE_BAJA_TAU_S = 0.7
/** Cada cuánto se releen las cajas de texto mientras hay anillos vivos (quieto / con scroll). */
const TEXTO_CADA_MS = 200
const TEXTO_CADA_MS_CON_SCROLL = 60
/** La pluma de la atenuación del pulso alrededor del texto, en píxeles CSS. */
const PLUMA_CSS = 24

type VentanaDelBanco = Window & { __escenaViva?: Record<string, unknown> }

interface PropsDelEntorno {
  readonly rig: ProbeRigStore
  readonly quieto: boolean
  readonly logoGroupRef: RefObject<THREE.Group | null>
}

export function Entorno({ rig, quieto, logoGroupRef }: PropsDelEntorno) {
  const e = entornoDeLaEscena()
  const hoverRef = useRef<HoverDelLogo | null>(null)
  const memoria = useRef({
    vp: new THREE.Matrix4(),
    primera: true,
    puntero: new THREE.Vector2(),
    tam: new THREE.Vector2(),
    pulso: null as EstadoDelPulso | null,
    progreso: Number.NaN,
    ultimoMovimiento: -Infinity,
    textoLeidoEn: 0,
    hover: false,
  })

  useEffect(() => {
    if (!e.E4 && !e.E7) return undefined
    const hover = crearHoverDelLogo()
    hoverRef.current = hover
    return () => {
      hover.soltar()
      hoverRef.current = null
    }
  }, [e.E4, e.E7])

  useFrame((state, delta) => {
    const m = memoria.current
    const dt = Math.min(delta, 0.1)
    if (!quieto) VIVO.uTiempo.value += dt
    const t = VIVO.uTiempo.value
    VIVO.uNoche.value = BRILLO_DE_LA_NOCHE.uNoche.value

    if (e.E1) {
      const nivel = NIVELES_DEL_HAZ[e.haz]
      VIVO.uHaz.value = 1
      VIVO.uHazDia.value.set(nivel.dia[0], nivel.dia[1], nivel.dia[2])
      VIVO.uHazNoche.value.set(nivel.noche[0], nivel.noche[1], nivel.noche[2])
    }

    if (e.E6) {
      const camara = state.camera
      camara.updateMatrixWorld()
      m.vp.multiplyMatrices(camara.projectionMatrix, camara.matrixWorldInverse)
      const previo = VIVO.uVPPrevio.value
      if (m.primera || quieto) {
        previo.copy(m.vp)
        m.primera = false
      } else {
        const k = 1 - Math.exp(-dt / ESTELA_TAU_S)
        const a = previo.elements
        const b = m.vp.elements
        for (let i = 0; i < 16; i += 1) a[i] += (b[i] - a[i]) * k
      }
      state.gl.getDrawingBufferSize(m.tam)
      VIVO.uResolucion.value.copy(m.tam)
      VIVO.uEstela.value = quieto ? 0 : 1
    }

    const hover = hoverRef.current

    if (e.E7) {
      const alcance = NIVELES_DEL_CURSOR[e.cursor]
      VIVO.uCursorAlcance.value.set(alcance[0], alcance[1], alcance[2])
      VIVO.uAspecto.value = state.size.width / Math.max(1, state.size.height)
      const velocidad = dt > 0 ? state.pointer.distanceTo(m.puntero) / dt : 0
      m.puntero.copy(state.pointer)
      VIVO.uCursor.value.lerp(state.pointer, 1 - Math.exp(-dt / CURSOR_TAU_S))
      // Táctil y movimiento reducido: sin empuje.
      const activo = !quieto && hover !== null && hover.fino()
      const objetivo = activo ? Math.min(1, velocidad * 0.9) : 0
      const actual = VIVO.uEmpuje.value
      const tau = objetivo > actual ? EMPUJE_SUBE_TAU_S : EMPUJE_BAJA_TAU_S
      VIVO.uEmpuje.value = actual + (objetivo - actual) * (1 - Math.exp(-dt / tau))
      // Con la estela: el mismo retraso que la copia de la cámara.
      const k = 1 - Math.exp(-dt / ESTELA_TAU_S)
      VIVO.uCursorPrevio.value.lerp(VIVO.uCursor.value, k)
      VIVO.uEmpujePrevio.value += (VIVO.uEmpuje.value - VIVO.uEmpujePrevio.value) * k
    }

    if (e.E4 && !quieto) {
      const progreso = rig.current.progress
      if (progreso !== m.progreso) {
        m.progreso = progreso
        m.ultimoMovimiento = t
      }
      const scrollEnMovimiento = t - m.ultimoMovimiento < PULSO.quietudDelScrollS
      m.hover = hover !== null ? hover.leer(state.camera, state.gl.domElement, logoGroupRef.current, progreso) : false
      const antes = m.pulso ?? pulsoInicial(t)
      m.pulso = avanzarElPulso(antes, { t, scrollEnMovimiento, hover: m.hover, reducido: quieto })
      escribirLosAnillos(m.pulso)
      // Las cajas de texto sólo importan con anillos vivos; se releen con freno.
      const ahora = performance.now()
      const cada = scrollEnMovimiento ? TEXTO_CADA_MS_CON_SCROLL : TEXTO_CADA_MS
      if (e.mascaraDeTexto && m.pulso.anillos.length > 0 && ahora - m.textoLeidoEn > cada) {
        m.textoLeidoEn = ahora
        const lienzo = state.gl.domElement
        leerCajasDeTexto(lienzo, VIVO.uTexto.value, PLUMA_CSS)
        const r = lienzo.getBoundingClientRect()
        VIVO.uPluma.value = PLUMA_CSS * (r.width > 0 ? lienzo.width / r.width : 1)
      }
    }

    if (hayBanco()) {
      ;(window as VentanaDelBanco).__escenaViva = {
        t,
        modo: m.pulso?.modo ?? null,
        anillos: m.pulso?.anillos.map((a) => a.clase) ?? [],
        hover: m.hover,
        empuje: VIVO.uEmpuje.value,
        noche: VIVO.uNoche.value,
        estela: VIVO.uEstela.value,
      }
    }
  })

  return (
    <>
      {e.E1 && <Haz />}
      {e.E4 && !quieto && <Pulso />}
    </>
  )
}

/** Vuelca los anillos vivos a `uAnillos` y anota el último principal para la sombra. */
function escribirLosAnillos(pulso: EstadoDelPulso): void {
  const destino = VIVO.uAnillos.value
  for (let i = 0; i < destino.length; i += 1) {
    const anillo = pulso.anillos[i]
    if (anillo === undefined) {
      destino[i].set(0, 1, 0, 0)
      continue
    }
    const clase = PULSO.anillos[anillo.clase]
    destino[i].set(anillo.nace, clase.duracionS, clase.alcance, clase.amplitud)
    if (anillo.clase === 'principal' && anillo.nace > PULSO_VIVO.ultimoPrincipal) PULSO_VIVO.ultimoPrincipal = anillo.nace
  }
}
