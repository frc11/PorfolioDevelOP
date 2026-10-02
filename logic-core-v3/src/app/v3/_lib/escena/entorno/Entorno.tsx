'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'

import { AMANECER_EN_VIVO } from '../amanecer/luz'
import { entornoDeLaEscena, hayBanco } from '../entorno'
import { BRILLO_DE_LA_NOCHE } from '../particleGlow'
import type { ProbeRigStore } from '../probeStore'
import { PULSO_PEDIDO, vigente } from '../interfaz/pedidos'
import { callar, sonar } from '../../sonido/bus'
import { TUNEL_EN_LA_ESCENA } from '../tunelEnLaEscena'
import { HAZ_ENCENDIDO, avanzarElEncendido, encendidoInicial, type EstadoDelEncendido } from './encendido'
import { Haz } from './Haz'
import { LOGO_BAJO_EL_PUNTERO, crearHoverDelLogo, type HoverDelLogo } from './hoverDelLogo'
import { nocheDelLogo } from './nocheDelLogo'
import { Pulso } from './Pulso'
import { PULSO, avanzarElPulso, pulsoInicial, type EstadoDelPulso } from './maquinaDelPulso'
import { ALCANCE_DEL_CURSOR, NIVELES_DEL_HAZ, PULSO_VIVO, VIVO } from './vivo'

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

type VentanaDelBanco = Window & { __escenaViva?: Record<string, unknown>; __relojDelBanco?: { detenido: boolean; t?: number } }

/** [ESCENA 6] El banco puede detener el reloj de la escena (y ponerlo en un instante) para fotografiar un anillo quieto. */
function relojDelBanco(): { detenido: boolean; t?: number } | undefined {
  return hayBanco() ? (window as VentanaDelBanco).__relojDelBanco : undefined
}

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
    encendido: null as EstadoDelEncendido | null,
    progreso: Number.NaN,
    ultimoMovimiento: -Infinity,
    hover: false,
    entradas: { t: 0, scrollEnMovimiento: false, hover: false, reducido: false, pedido: false },
    // [INTERFAZ 2] T1 · el último pedido de pulso atendido (`interfaz/pedidos.ts`).
    pulsoAtendido: PULSO_PEDIDO.n,
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
    const reloj = relojDelBanco()
    if (reloj?.t !== undefined) VIVO.uTiempo.value = reloj.t
    else if (!quieto && reloj?.detenido !== true) VIVO.uTiempo.value += dt
    const t = VIVO.uTiempo.value
    VIVO.uNoche.value = BRILLO_DE_LA_NOCHE.uNoche.value
    // [ESCENA 10] T1: la noche en el logo (la del amanecer, hasta que su frente lo alcanza): la siguen el haz y las sombras.
    VIVO.uNocheDelLogo.value = nocheDelLogo(VIVO.uNoche.value, AMANECER_EN_VIVO.uBarridoDelDia.value, AMANECER_EN_VIVO.uFrenteDelDia.value)

    if (e.E1) {
      const nivel = NIVELES_DEL_HAZ[e.haz]
      // [ESCENA 6] 6e: la parte de noche del haz sigue al encendido (1 sin él). [ESCENA 7] En el producto.
      let k = 1
      if (e.hazEncendido) {
        const antesDelHaz = m.encendido
        const noche = VIVO.uNocheDelLogo.value
        m.encendido = avanzarElEncendido(m.encendido ?? encendidoInicial(noche, t), noche, t, quieto)
        // [3D Y SONIDO] T2: el guion suena (el zumbido sigue a los intentos); si se apaga a mitad, se calla.
        if (antesDelHaz !== null && m.encendido.fase !== antesDelHaz.fase) {
          if (m.encendido.fase === 'encendiendo') sonar('encendido')
          else if (antesDelHaz.fase === 'encendiendo') callar('encendido')
        }
        k = m.encendido.k
        encender(k)
      }
      VIVO.uHaz.value = 1
      VIVO.uHazDia.value.set(nivel.dia[0], nivel.dia[1], nivel.dia[2])
      VIVO.uHazNoche.value.set(nivel.noche[0] * k, nivel.noche[1] * k, nivel.noche[2] * k)
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
      VIVO.uCursorAlcance.value.set(ALCANCE_DEL_CURSOR[0], ALCANCE_DEL_CURSOR[1], ALCANCE_DEL_CURSOR[2])
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
    }

    if (e.E4 && !quieto) {
      const progreso = rig.current.progress
      if (progreso !== m.progreso) {
        // [3D Y SONIDO] T2: entrar al túnel de Trabajos (de cualquier lado) suena un soplido; al cargar adentro, no.
        if (!Number.isNaN(m.progreso) && !enElTunel(m.progreso) && enElTunel(progreso)) sonar('tunel')
        m.progreso = progreso
        m.ultimoMovimiento = t
      }
      const scrollEnMovimiento = t - m.ultimoMovimiento < PULSO.quietudDelScrollS
      m.hover = hover !== null ? hover.leer(state.camera, state.gl.domElement, logoGroupRef.current, progreso) : false
      LOGO_BAJO_EL_PUNTERO.sobre = m.hover // [INTERFAZ 1] T2: para el cursor del DOM
      const antes = m.pulso ?? pulsoInicial(t)
      // [CALIDAD 1] B2: las entradas del pulso, siempre el mismo objeto.
      const entradas = m.entradas
      entradas.t = t
      entradas.scrollEnMovimiento = scrollEnMovimiento
      entradas.hover = m.hover
      entradas.reducido = quieto
      // [INTERFAZ 2] T1 · un CTA pide el principal: sólo un pedido nuevo y reciente.
      entradas.pedido = false
      if (PULSO_PEDIDO.n !== m.pulsoAtendido) {
        m.pulsoAtendido = PULSO_PEDIDO.n
        entradas.pedido = vigente(PULSO_PEDIDO.cuando, performance.now())
      }
      m.pulso = avanzarElPulso(antes, entradas)
      // [3D Y SONIDO] T2: un principal que nace en este cuadro (lo larga el hover del logo o un CTA), un golpe grave.
      if (m.pulso.anillos !== antes.anillos && nacioUnPrincipal(m.pulso, t)) sonar('pulso')
      escribirLosAnillos(m.pulso)
    }

    if (hayBanco()) {
      ;(window as VentanaDelBanco).__escenaViva = {
        t,
        modo: m.pulso?.modo ?? null,
        anillos: m.pulso?.anillos.map((a) => a.clase) ?? [], // banco
        nacen: m.pulso?.anillos.map((a) => a.nace) ?? [], // banco
        hover: m.hover,
        empuje: VIVO.uEmpuje.value,
        noche: VIVO.uNoche.value,
        nocheDelLogo: VIVO.uNocheDelLogo.value,
        estela: VIVO.uEstela.value,
        encendido: m.encendido === null ? null : { fase: m.encendido.fase, k: m.encendido.k },
      }
    }
  })

  return (
    <>
      {e.E1 && <Haz conCharco={!e.pisoVivo} />}
      {e.E4 && !quieto && !e.pisoVivo && <Pulso />}
    </>
  )
}

/** 6e: lo que leen las motas y la sombra. */
function encender(k: number): void {
  HAZ_ENCENDIDO.k = k
}

/** [3D Y SONIDO] T2 · ¿el progreso está en el túnel? */
function enElTunel(p: number): boolean {
  return p >= TUNEL_EN_LA_ESCENA.desde && p <= TUNEL_EN_LA_ESCENA.hasta
}

/** [3D Y SONIDO] T2 · ¿nació un principal en el instante `t`? Sin reservar nada (sólo se pregunta si cambiaron los anillos). */
function nacioUnPrincipal(pulso: EstadoDelPulso, t: number): boolean {
  for (let i = 0; i < pulso.anillos.length; i += 1) if (pulso.anillos[i].clase === 'principal' && pulso.anillos[i].nace === t) return true
  return false
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
