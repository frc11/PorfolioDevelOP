'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'

import { entornoDeLaEscena, hayBanco } from '../entorno'
import { crearCronometro, type Medida } from '../gpu/cronometro'
import { crearPingPong } from '../gpu/pingPong'
import { FLOOR_Y } from '../probeScene'
import type { ProbeRigStore } from '../probeStore'
import { FISICA, SIMULACION_DEL_POLVO_GLSL } from './simulacion'
import { AIRE } from './parche'
import { PISO_EN_VIVO } from '../piso/enVivo'
import { POSARSE, avanzarElPolvo, polvoInicial, type EstadoDelPolvo } from './posarse'
import { conchasDelPolvoParejo, posicionesDelPolvoParejo } from './volumen'

/**
 * [ESCENA 6] LA FÍSICA DEL POLVO — corre la simulación de `simulacion.ts` una vez por cuadro, después del
 * rig y del aire (lee la cámara, las conchas, la pose del logo y el aire que corre de este cuadro). Con
 * `posarse` y el polvo parejo: en el producto desde ESCENA 7.
 *
 * Lleva su propio reloj (el de la escena, salvo que el banco pida cámara lenta) y la máquina de la
 * quietud de `posarse.ts`. El remolino del despertar sólo sopla si el polvo llegó a posarse (la
 * quietud duró más que `POSARSE.empiezaS`): mover el cursor después de una pausa corta no arma nada.
 *
 * [ESCENA 7] T7: 6b se borró; el logo como obstáculo del aire que corre está en la
 * simulación (`alrededorDelLogo`, y las motas que quedan pegadas, modo 6).
 */

interface PropsDeLaFisica {
  readonly rig: ProbeRigStore
  readonly quieto: boolean
  readonly dustGroupRef: RefObject<THREE.Group | null>
}

type VentanaDelBanco = Window & {
  __fisicaDelBanco?: { modos: () => number[]; camaraLenta: (escala: number) => void; corrimiento: () => number[]; medir: (pasos: number) => Promise<Medida> }
}

export function Fisica(props: PropsDeLaFisica) {
  const e = entornoDeLaEscena()
  if (!e.polvoParejo || !e.posarse) return null
  return <FisicaPrendida {...props} />
}

function FisicaPrendida({ rig, quieto, dustGroupRef }: PropsDeLaFisica) {
  const { posarse } = entornoDeLaEscena()
  const armado = useMemo(() => armar(), [])
  useEffect(() => () => armado.soltar(), [armado])
  const memoria = useRef({
    inicio: true,
    reloj: 0,
    escala: 1,
    polvo: null as EstadoDelPolvo | null,
    progreso: Number.NaN,
    puntero: new THREE.Vector2(9, 9),
    rayo: new THREE.Raycaster(),
    plano: new THREE.Plane(new THREE.Vector3(0, 1, 0), -FLOOR_Y),
    punto: new THREE.Vector3(),
    movimiento: 0,
    gl: null as THREE.WebGLRenderer | null,
  })

  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    ventana.__fisicaDelBanco = {
      modos: () => {
        const gl = memoria.current.gl
        if (gl === null) return []
        const datos = armado.sim.leer(gl, 0)
        // Aire, cayendo, en el piso, sobre el logo, deslizando, levantada y pegada.
        const cuenta = [0, 0, 0, 0, 0, 0, 0]
        for (let k = 0; k < armado.cuantas; k += 1) cuenta[Math.min(6, Math.max(0, Math.round(datos[k * 4 + 3])))] += 1
        return cuenta
      },
      camaraLenta: (escala) => {
        memoria.current.escala = escala
      },
      medir: (pasos) => armado.cronometro.pedir(pasos),
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
      armado.sim.llenar(gl, new THREE.Vector4(0, 0, 0, 0))
      m.inicio = false
    }
    const dustGroup = dustGroupRef.current
    if (dustGroup === null) return
    const dtReal = Math.min(delta, 1 / 30)
    const dt = quieto ? 0 : dtReal * m.escala
    m.reloj += dt

    // La quietud y el despertar (en el reloj de la física): el cursor, desde el piso bajo el puntero;
    // el scroll, desde el piso delante de la cámara.
    const progreso = rig.current.progress
    const scroll = !Number.isNaN(m.progreso) && Math.abs(progreso - m.progreso) > 1e-6
    const velocidadDelScroll = Number.isNaN(m.progreso) || dtReal <= 0 ? 0 : Math.abs(progreso - m.progreso) / dtReal
    const cursor = m.puntero.x < 5 && m.puntero.distanceToSquared(state.pointer) > 1e-8
    m.progreso = progreso
    m.puntero.copy(state.pointer)
    let origen: [number, number, number] | null = null
    if (cursor) {
      m.rayo.setFromCamera(state.pointer, state.camera)
      const toca = m.rayo.ray.intersectPlane(m.plano, m.punto)
      if (toca !== null) origen = [toca.x, FLOOR_Y, toca.z]
    }
    if (origen === null && (scroll || cursor)) {
      const adelante = state.camera.getWorldDirection(m.punto.set(0, 0, 0)).setY(0).normalize()
      origen = [state.camera.position.x + adelante.x * 6, FLOOR_Y, state.camera.position.z + adelante.z * 6]
    }
    m.polvo = avanzarElPolvo(m.polvo ?? polvoInicial(m.reloj), m.reloj, origen, quieto || !posarse)
    // Cuánto se mueve la coreografía (0–1): lo que hace resbalar el polvo del logo.
    m.movimiento += (Math.min(1, velocidadDelScroll * 25) - m.movimiento) * (1 - Math.exp(-dtReal / 0.2))


    dustGroup.updateMatrixWorld(true)
    const conchas: THREE.Matrix4[] = []
    for (const hijo of dustGroup.children) {
      const puntos = hijo.children.find((o) => o instanceof THREE.Points)
      if (puntos !== undefined) conchas.push(puntos.matrixWorld)
    }
    if (conchas.length < 3) return
    const adelante = state.camera.getWorldDirection(new THREE.Vector3())
    const despertar = m.polvo
    // El remolino del despertar sólo si el polvo alcanzó a posarse antes de despertar.
    const conRemolino = despertar.desperto - despertar.antes > POSARSE.empiezaS
    alPaso(armado.sim.material.uniforms, {
      conchas,
      camara: state.camera.position,
      adelante,
      dt,
      reloj: m.reloj,
      posarse: posarse ? 1 : 0,
      quieto: despertar.quieto,
      desperto: conRemolino ? despertar.desperto : -1e9,
      origen: despertar.origen,
      movimiento: m.movimiento,
    })
    if (dt > 0) armado.cronometro.correr(gl, () => armado.sim.paso(gl))
    publicar(armado.sim.estado()[0])
  })

  return null
}

interface Paso {
  readonly conchas: readonly THREE.Matrix4[]
  readonly camara: THREE.Vector3
  readonly adelante: THREE.Vector3
  readonly dt: number
  readonly reloj: number
  readonly posarse: number
  readonly quieto: number
  readonly desperto: number
  readonly origen: readonly [number, number, number]
  readonly movimiento: number
}

function alPaso(u: Record<string, THREE.IUniform>, p: Paso): void {
  const conchas = u.uConcha.value as THREE.Matrix4[]
  p.conchas.forEach((c, i) => conchas[i].copy(c))
  ;(u.uCamara.value as THREE.Vector3).copy(p.camara)
  ;(u.uAdelante.value as THREE.Vector3).copy(p.adelante)
  u.uDt.value = p.dt
  u.uReloj.value = p.reloj
  u.uPosarse.value = p.posarse
  u.uQuieto.value = p.quieto
  u.uDesperto.value = p.desperto
  ;(u.uOrigen.value as THREE.Vector3).set(...p.origen)
  u.uMovimiento.value = p.movimiento
}

function publicar(textura: THREE.Texture): void {
  AIRE.uFisica.value = textura
}

function armar() {
  const posiciones = posicionesDelPolvoParejo()
  const cuantas = posiciones.length / 3
  const ancho = FISICA.ancho
  const alto = Math.ceil(cuantas / ancho)
  const origenes = new Float32Array(ancho * alto * 4)
  const conchas = conchasDelPolvoParejo(cuantas)
  for (let k = 0; k < cuantas; k += 1) origenes.set([posiciones[k * 3], posiciones[k * 3 + 1], posiciones[k * 3 + 2], conchas[k]], k * 4)
  const texturaDeOrigenes = new THREE.DataTexture(origenes, ancho, alto, THREE.RGBAFormat, THREE.FloatType)
  texturaDeOrigenes.needsUpdate = true
  const sim = crearPingPong(
    ancho,
    alto,
    2,
    SIMULACION_DEL_POLVO_GLSL,
    {
      uOrigenes: { value: texturaDeOrigenes },
      uCuantas: { value: cuantas },
      uConcha: { value: [new THREE.Matrix4(), new THREE.Matrix4(), new THREE.Matrix4()] },
      uCamara: { value: new THREE.Vector3() },
      uAdelante: { value: new THREE.Vector3(0, 0, -1) },
      uDeriva: AIRE.uDeriva,
      uDt: { value: 0 },
      uReloj: { value: 0 },
      uPosarse: { value: 0 },
      uQuieto: { value: 1e9 },
      uDesperto: { value: -1e9 },
      uOrigen: { value: new THREE.Vector3() },
      uMovimiento: { value: 0 },
      uVientoDelAire: AIRE.uVientoDelAire,
      uPisoVivo: PISO_EN_VIVO.uPisoVivo,
      uGrillaDelPiso: PISO_EN_VIVO.uGrillaDelPiso,
      uLogoC: AIRE.uLogoC,
      uLogoP: AIRE.uLogoP,
      uLogoPalo: AIRE.uLogoPalo,
      uLogo: AIRE.uLogo,
      uLogoInverso: AIRE.uLogoInverso,
    },
    true,
  )
  return {
    cuantas,
    sim,
    cronometro: crearCronometro(),
    soltar: () => {
      sim.soltar()
      texturaDeOrigenes.dispose()
    },
  }
}
