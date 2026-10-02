'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'

import { entornoDeLaEscena, hayBanco } from '../entorno'
import type { Medida } from '../gpu/cronometro'
import { vecesQueSeMovioLaPagina } from '../paginaMovida'
import { FLOOR_Y } from '../probeScene'
import type { ProbeRigStore } from '../probeStore'
import { alPaso, armar, correr, hornearDeAPoco, mallasDelLogo, pasoInicial, publicar, type MedidaDelCampo } from './armadoDeLaFisica'
import { AIRE } from './parche'
import { CAMPO_EN_VIVO, campoDeAPoco, contornoDeLaMalla, publicarElCampo } from './campoDelLogo'
import { POSARSE, avanzarElPolvoEn, polvoInicial, type EstadoDelPolvoVivo } from './posarse'

/**
 * [ESCENA 6] LA FÍSICA DEL POLVO — corre la simulación de `simulacion.ts` una vez por cuadro, después del
 * rig y del aire (lee la cámara, las conchas, la pose del logo y el aire que corre de este cuadro). Con
 * `posarse` y el polvo parejo: en el producto desde ESCENA 7.
 *
 * Lleva su propio reloj (el de la escena, salvo que el banco pida cámara lenta) y la máquina de la
 * quietud de `posarse.ts`. El remolino del despertar sólo sopla si el polvo llegó a posarse (la
 * quietud duró más que `POSARSE.empiezaS`): mover el cursor después de una pausa corta no arma nada.
 *
 * [ESCENA 8] T5: arma una vez el campo de distancia de la malla real del logo (`campoDelLogo.ts`) cuando las
 * mallas ya están, fuera del cuadro (en un momento libre). [CALIDAD 1] B1: DE A POCO (`hornearDeAPoco`).
 * [ESCENA 9] T1: sólo para el polvo que se posa sobre el logo; el campo del flujo y la pose del logo del cuadro
 * anterior (la velocidad de su superficie, para el contacto) se borraron con el obstáculo.
 */

interface PropsDeLaFisica {
  readonly rig: ProbeRigStore
  readonly quieto: boolean
  readonly dustGroupRef: RefObject<THREE.Group | null>
  /** [ESCENA 8] T5 · el grupo del logo: sus mallas son las del campo de distancia. */
  readonly logoGroupRef: RefObject<THREE.Group | null>
}

type VentanaDelBanco = Window & {
  __fisicaDelBanco?: { modos: () => number[]; camaraLenta: (escala: number) => void; corrimiento: () => number[]; medir: (pasos: number) => Promise<Medida>; campo: () => MedidaDelCampo | null; estado: () => Float32Array | null; aire: () => typeof AIRE }
}

export function Fisica(props: PropsDeLaFisica) {
  const e = entornoDeLaEscena()
  if (!e.polvoParejo || !e.posarse) return null
  return <FisicaPrendida {...props} />
}

function FisicaPrendida({ rig, quieto, dustGroupRef, logoGroupRef }: PropsDeLaFisica) {
  const { posarse } = entornoDeLaEscena()
  const armado = useMemo(() => armar(), [])
  useEffect(() => () => armado.soltar(), [armado])
  const memoria = useRef({
    inicio: true,
    reloj: 0,
    escala: 1,
    polvo: null as EstadoDelPolvoVivo | null,
    progreso: Number.NaN,
    pagina: 0,
    puntero: new THREE.Vector2(9, 9),
    rayo: new THREE.Raycaster(),
    plano: new THREE.Plane(new THREE.Vector3(0, 1, 0), -FLOOR_Y),
    punto: new THREE.Vector3(),
    movimiento: 0,
    gl: null as THREE.WebGLRenderer | null,
    // [ESCENA 8] T5: el campo del logo (se arma una vez).
    campo: 'falta' as 'falta' | 'armando' | 'listo',
    medidaDelCampo: null as MedidaDelCampo | null,
    textura: null as THREE.Data3DTexture | null,
    // [CALIDAD 1] B2: todo lo que el cuadro usa, armado una vez (cero reservas por cuadro).
    origen: [0, 0, 0] as [number, number, number],
    adelante: new THREE.Vector3(),
    conchas: [] as THREE.Matrix4[],
    paso: pasoInicial(),
  })

  // [ESCENA 8] T5: al desmontarse, el campo se libera y la simulación vuelve a no tener logo.
  useEffect(
    () => () => {
      memoria.current.textura?.dispose()
      CAMPO_EN_VIVO.uCampoDelLogo.value = null
      CAMPO_EN_VIVO.uHayCampo.value = 0
    },
    [],
  )

  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    ventana.__fisicaDelBanco = {
      modos: () => {
        const gl = memoria.current.gl
        if (gl === null) return []
        const datos = armado.sim.leer(gl, 0)
        // Aire, cayendo, en el piso, sobre el logo, deslizando y levantada ([CALIDAD 1] A3: la pegada se borró; [ESCENA 9]
        // T1: el deslizar también, su casilla queda en 0).
        const cuenta = [0, 0, 0, 0, 0, 0]
        for (let k = 0; k < armado.cuantas; k += 1) cuenta[Math.min(5, Math.max(0, Math.round(datos[k * 4 + 3])))] += 1
        return cuenta
      },
      camaraLenta: (escala) => {
        memoria.current.escala = escala
      },
      medir: (pasos) => armado.cronometro.pedir(pasos),
      campo: () => memoria.current.medidaDelCampo,
      // [CALIDAD 1] B4 · para el instrumento de los saltos (inyectado desde el banco): el estado crudo y los uniforms del aire.
      estado: () => (memoria.current.gl === null ? null : armado.sim.leer(memoria.current.gl, 0)),
      aire: () => AIRE,
      // Cuánto corrió el aire a las motas que están en el aire: cuántas se movieron más de 0,1, la media y la máxima.
      corrimiento: () => {
        const gl = memoria.current.gl
        if (gl === null) return []
        const datos = armado.sim.leer(gl, 0)
        let [movidas, suma, maxima] = [0, 0, 0]
        for (let k = 0; k < armado.cuantas; k += 1) {
          if (Math.round(datos[k * 4 + 3]) !== 0) continue
          const d = Math.hypot(datos[k * 4], datos[k * 4 + 1], datos[k * 4 + 2])
          if (d > 0.1) movidas += 1
          suma += d
          maxima = Math.max(maxima, d)
        }
        return [movidas, suma / armado.cuantas, maxima]
      },
    }
    return () => {
      delete ventana.__fisicaDelBanco
    }
  }, [armado])

  useFrame((state, delta) => {
    const m = memoria.current
    const gl = state.gl
    m.gl = gl
    if (m.inicio) {
      armado.sim.llenar(gl, new THREE.Vector4(0, 0, 0, 0)) // una vez
      m.inicio = false
    }
    // [ESCENA 8] T5: el campo de la malla real, una vez, en un momento libre (no en este cuadro).
    const grupoDelLogo = logoGroupRef.current
    if (m.campo === 'falta' && grupoDelLogo !== null) {
      const mallas = mallasDelLogo(grupoDelLogo)
      if (mallas.length > 0) {
        m.campo = 'armando'
        // [CALIDAD 1] B1: de a poco. El `ms` es de punta a punta (con las esperas entre momentos libres), no de trabajo.
        const empezar = (): void => {
          const contorno = contornoDeLaMalla(mallas)
          const tramos = contorno.tramos.length / 4
          const fino = campoDeAPoco(contorno)
          hornearDeAPoco(fino, (ms) => {
            const campo = fino.campo()
            m.textura = publicarElCampo(campo)
            m.medidaDelCampo = { ms, celdas: [...campo.n], tramos } // una vez
            m.campo = 'listo'
          })
        }
        if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(empezar, { timeout: 1500 })
        else window.setTimeout(empezar, 0)
      }
    }
    const dustGroup = dustGroupRef.current
    if (dustGroup === null) return
    const dtReal = Math.min(delta, 1 / 30)
    const dt = quieto ? 0 : dtReal * m.escala
    m.reloj += dt

    // La quietud y el despertar (en el reloj de la física): el cursor, desde el piso bajo el puntero;
    // el scroll, desde el piso delante de la cámara.
    const progreso = rig.current.progress
    // [CIERRE RETOQUE 3D] B2: o la página se movió (después del último nudo el progreso queda en 1).
    const pagina = vecesQueSeMovioLaPagina()
    const scroll = (!Number.isNaN(m.progreso) && Math.abs(progreso - m.progreso) > 1e-6) || pagina !== m.pagina
    m.pagina = pagina
    const velocidadDelScroll = Number.isNaN(m.progreso) || dtReal <= 0 ? 0 : Math.abs(progreso - m.progreso) / dtReal
    const cursor = m.puntero.x < 5 && m.puntero.distanceToSquared(state.pointer) > 1e-8
    m.progreso = progreso
    m.puntero.copy(state.pointer)
    let hayOrigen = false
    let delCursor = false
    if (cursor) {
      m.rayo.setFromCamera(state.pointer, state.camera)
      const toca = m.rayo.ray.intersectPlane(m.plano, m.punto)
      if (toca !== null) {
        m.origen[0] = toca.x
        m.origen[1] = FLOOR_Y
        m.origen[2] = toca.z
        hayOrigen = true
        delCursor = true
      }
    }
    if (!hayOrigen && (scroll || cursor)) {
      const adelante = state.camera.getWorldDirection(m.punto.set(0, 0, 0)).setY(0).normalize()
      m.origen[0] = state.camera.position.x + adelante.x * 6
      m.origen[1] = FLOOR_Y
      m.origen[2] = state.camera.position.z + adelante.z * 6
      hayOrigen = true
    }
    if (m.polvo === null) {
      const inicial = polvoInicial(m.reloj)
      m.polvo = { ...inicial, origen: [inicial.origen[0], inicial.origen[1], inicial.origen[2]] } // una vez
    }
    avanzarElPolvoEn(m.polvo, m.reloj, hayOrigen ? m.origen : null, quieto || !posarse, delCursor)
    // Cuánto se mueve la coreografía (0–1): lo que levanta el polvo del logo ([ESCENA 9] T1: antes lo hacía resbalar).
    m.movimiento += (Math.min(1, velocidadDelScroll * 25) - m.movimiento) * (1 - Math.exp(-dtReal / 0.2))


    dustGroup.updateMatrixWorld(true)
    const conchas = m.conchas
    conchas.length = 0
    for (const hijo of dustGroup.children) {
      for (const o of hijo.children) {
        if (o instanceof THREE.Points) {
          conchas.push(o.matrixWorld)
          break
        }
      }
    }
    if (conchas.length < 3) return
    const despertar = m.polvo
    // El remolino del despertar sólo si el polvo alcanzó a posarse antes de despertar.
    const conRemolino = despertar.desperto - despertar.antes > POSARSE.empiezaS
    const p = m.paso
    p.conchas = conchas
    p.camara = state.camera.position
    p.adelante = state.camera.getWorldDirection(m.adelante)
    p.dt = dt
    p.reloj = m.reloj
    p.posarse = posarse ? 1 : 0
    p.quieto = despertar.quieto
    p.desperto = conRemolino ? despertar.desperto : -1e9
    p.origen = despertar.origen
    // [RETOQUE 3D] B3 · el remolino, sólo en el despertar del cursor (donde se movió la mano); el del scroll, sólo el frente.
    p.remolino = despertar.delCursor ? 1 : 0
    p.movimiento = m.movimiento
    alPaso(armado.sim.material.uniforms, p)
    if (dt > 0) correr(armado, gl)
    publicar(armado.sim.estado()[0])
  })

  return null
}
