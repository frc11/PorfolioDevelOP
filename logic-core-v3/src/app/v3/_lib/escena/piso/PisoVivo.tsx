'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import type { NivelDeCalidad } from '../calidad'
import type { ProbeRigStore } from '../probeStore'
import { entornoDeLaEscena, hayBanco } from '../entorno'
import { NACE_EN } from '../entorno/Pulso'
import { PULSO } from '../entorno/maquinaDelPulso'
import { PULSO_VIVO, VIVO } from '../entorno/vivo'
import { pisoConFormacion } from '../formacion/Formacion'
import { crearCronometro, type Medida } from '../gpu/cronometro'
import { crearPingPong } from '../gpu/pingPong'
import { FLOOR_RADIUS, FLOOR_Y, PAPER_COLOR } from '../probeScene'
import { conElDiaDesdeAfuera } from '../dia/desdeAfuera'
import { MANCHA_EN_EL_PISO } from '../sombra/enElPiso'
import { PISO_VIVO, SIMULACION_GLSL, centroDeLaCelda, conPisoVivo, geometriaDelBloque, grillaDelPiso, type Grilla } from './bloques'

/**
 * [ESCENA 6] EL PISO VIVO — monta los bloques y corre la simulación (`bloques.ts` tiene el porqué).
 * Va después del rig y del entorno: lee la cámara, el cursor y el pulso de este cuadro. Con movimiento
 * reducido queda el relieve de reposo, quieto.
 */

type VentanaDelBanco = Window & {
  __pisoDelBanco?: {
    bloques: number
    triangulos: number
    celdas: number
    medir: (pasos: number) => Promise<Medida>
    /** La altura más alta y la más baja de la simulación, y la presencia del cursor. */
    estado: () => { maximo: number; minimo: number; presencia: number; agita: number; cursor: number[] }
  }
}

interface PropsDelPiso {
  readonly rig: ProbeRigStore
  readonly calidad: NivelDeCalidad
  readonly quieto: boolean
}

/** ¿Hay piso vivo en esta carga? Los planos apoyados en el piso lo preguntan para esconderse. */
export function hayPisoVivo(): boolean {
  return entornoDeLaEscena().pruebas.pisoVivo !== 'no'
}

export function PisoVivo(props: PropsDelPiso) {
  if (!hayPisoVivo()) return null
  return <PisoVivoPrendido {...props} />
}

function PisoVivoPrendido({ rig, calidad, quieto }: PropsDelPiso) {
  const radio = pisoConFormacion(calidad)?.radio ?? FLOOR_RADIUS
  const conPulso = entornoDeLaEscena().pruebas.pisoVivo === 'pulso'
  const armado = useMemo(() => armar(grillaDelPiso(radio)), [radio])
  useEffect(() => () => armado.soltar(), [armado])
  const memoria = useRef({
    inicio: true,
    puntero: new THREE.Vector2(9, 9),
    presencia: 0,
    ultimoCursor: -Infinity,
    cursor: new THREE.Vector2(),
    camara: new THREE.Vector3(),
    progreso: Number.NaN,
    primera: true,
    agita: 0,
    rayo: new THREE.Raycaster(),
    plano: new THREE.Plane(new THREE.Vector3(0, 1, 0), -FLOOR_Y),
    punto: new THREE.Vector3(),
  })

  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    ventana.__pisoDelBanco = {
      bloques: armado.grilla.cuantas,
      triangulos: armado.grilla.cuantas * 10,
      celdas: armado.grilla.n * armado.grilla.n,
      estado: () => {
        const datos = armado.sim.leer(armado.gl.current ?? new THREE.WebGLRenderer())
        let [maximo, minimo] = [-Infinity, Infinity]
        for (let k = 0; k < datos.length; k += 4) {
          maximo = Math.max(maximo, datos[k])
          minimo = Math.min(minimo, datos[k])
        }
        const m = memoria.current
        return { maximo, minimo, presencia: m.presencia, agita: m.agita, cursor: [m.cursor.x, m.cursor.y] }
      },
      medir: (pasos) => armado.cronometro.pedir(pasos),
    }
    return () => {
      delete ventana.__pisoDelBanco
    }
  }, [armado])

  useFrame((state, delta) => {
    const m = memoria.current
    const gl = state.gl
    guardarElContexto(armado, gl)
    if (m.inicio) {
      armado.sim.llenar(gl, new THREE.Vector4(0, 0, 0, 1))
      m.inicio = false
    }
    const dt = Math.min(Math.max(delta, 1 / 240), 1 / 30)
    const t = VIVO.uTiempo.value
    const g = armado.grilla

    // El cursor: el punto del piso bajo el puntero; la presencia sube al moverlo y se apaga quieto.
    const movio = m.puntero.x < 5 && m.puntero.distanceToSquared(state.pointer) > 1e-8
    m.puntero.copy(state.pointer)
    if (movio) m.ultimoCursor = t
    m.rayo.setFromCamera(state.pointer, state.camera)
    const toca = m.rayo.ray.intersectPlane(m.plano, m.punto)
    if (toca !== null) m.cursor.set(toca.x / g.lado, toca.z / g.lado)
    const presente = !quieto && toca !== null && t - m.ultimoCursor < PISO_VIVO.cursor.quietoS
    m.presencia += ((presente ? 1 : 0) - m.presencia) * (1 - Math.exp(-dt / (presente ? 0.15 : 0.8)))

    // El scroll: la velocidad de la cámara mientras el progreso se mueve, con la familia de inercia de E6.
    const progreso = rig.current.progress
    const conScroll = !Number.isNaN(m.progreso) && Math.abs(progreso - m.progreso) > 1e-6
    m.progreso = progreso
    const velocidad = m.primera || !conScroll ? 0 : state.camera.position.distanceTo(m.camara) / dt
    m.camara.copy(state.camera.position)
    m.primera = false
    const objetivo = quieto ? 0 : Math.min(1, velocidad / PISO_VIVO.scroll.plena)
    m.agita += (objetivo - m.agita) * (1 - Math.exp(-dt / (objetivo > m.agita ? PISO_VIVO.scroll.subeS : PISO_VIVO.scroll.bajaS)))

    // El pulso principal: dónde va su frente.
    const clase = PULSO.anillos.principal
    const u = (t - PULSO_VIVO.ultimoPrincipal) / clase.duracionS
    const vivo = conPulso && !quieto && u >= 0 && u <= 1
    const frente = NACE_EN + (clase.alcance - NACE_EN) * (1 - (1 - u) ** 2.2)

    const s = armado.sim.material.uniforms
    alPaso(s, {
      dt,
      c2: ((PISO_VIVO.onda.velocidad * dt) / g.lado) ** 2,
      cursor: [m.cursor.x, m.cursor.y, PISO_VIVO.cursor.radio / g.lado, m.presencia],
      agita: m.agita,
      t,
      anillo: [frente / g.lado, PISO_VIVO.pulso.ancho / g.lado, vivo ? PISO_VIVO.pulso.fuerza * (1 - u) : 0],
    })
    if (!quieto) correr(armado, gl)
    alCuadro(armado, VIVO.uHaz.value)
  })

  return <primitive object={armado.bloques} />
}

interface Paso {
  readonly dt: number
  readonly c2: number
  readonly cursor: readonly [number, number, number, number]
  readonly agita: number
  readonly t: number
  readonly anillo: readonly [number, number, number]
}

function alPaso(s: Record<string, THREE.IUniform>, p: Paso): void {
  s.uDt.value = p.dt
  s.uC2.value = p.c2
  ;(s.uCursor.value as THREE.Vector4).set(...p.cursor)
  s.uAgita.value = p.agita
  s.uTiempo.value = p.t
  ;(s.uAnillo.value as THREE.Vector3).set(...p.anillo)
}

/** Un paso de la simulación (medido si el banco lo pidió). */
function correr(armado: ReturnType<typeof armar>, gl: THREE.WebGLRenderer): void {
  armado.cronometro.correr(gl, () => armado.sim.paso(gl))
  armado.uAlturas.value = armado.sim.estado()[0]
}

function guardarElContexto(armado: ReturnType<typeof armar>, gl: THREE.WebGLRenderer): void {
  armado.gl.current = gl
}

function alCuadro(armado: ReturnType<typeof armar>, haz: number): void {
  armado.uHaz.value = haz
}

function armar(grilla: Grilla) {
  const uAlturas: { value: THREE.Texture | null } = { value: null }
  const uHaz = { value: 0 }
  const sim = crearPingPong(grilla.n, grilla.n, 1, SIMULACION_GLSL, {
    uDt: { value: 1 / 60 },
    uC2: { value: 0 },
    uRadio: { value: grilla.n / 2 },
    uCursor: { value: new THREE.Vector4(9999, 9999, 1, 0) },
    uAgita: { value: 0 },
    uTiempo: { value: 0 },
    uAnillo: { value: new THREE.Vector3(0, 1, 0) },
  })
  uAlturas.value = sim.estado()[0]
  const material = conPisoVivo(new THREE.MeshStandardMaterial({ color: PAPER_COLOR, roughness: 0.94, metalness: 0 }), {
    uAlturas,
    uLado: { value: grilla.lado },
    uHaz,
    uNoche: VIVO.uNoche,
    uTiempo: VIVO.uTiempo,
    uAnillos: VIVO.uAnillos,
    uHazDia: VIVO.uHazDia,
    uHazNoche: VIVO.uHazNoche,
    ...MANCHA_EN_EL_PISO,
  })
  conElDiaDesdeAfuera(material)
  const geometria = geometriaDelBloque(grilla.lado)
  geometria.setAttribute('aCelda', new THREE.InstancedBufferAttribute(grilla.celdas, 2))
  const bloques = new THREE.InstancedMesh(geometria, material, grilla.cuantas)
  bloques.frustumCulled = false
  const matriz = new THREE.Matrix4()
  for (let k = 0; k < grilla.cuantas; k += 1) {
    const [x, z] = centroDeLaCelda(grilla.celdas[k * 2], grilla.celdas[k * 2 + 1], grilla)
    bloques.setMatrixAt(k, matriz.makeTranslation(x, FLOOR_Y, z))
  }
  bloques.instanceMatrix.needsUpdate = true
  return {
    grilla,
    gl: { current: null as THREE.WebGLRenderer | null },
    cronometro: crearCronometro(),
    sim,
    bloques,
    uAlturas,
    uHaz,
    soltar: () => {
      sim.soltar()
      geometria.dispose()
      material.dispose()
      bloques.dispose()
    },
  }
}
