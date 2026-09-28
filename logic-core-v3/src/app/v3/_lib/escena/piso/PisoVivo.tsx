'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import type { NivelDeCalidad } from '../calidad'
import { entornoDeLaEscena, hayBanco } from '../entorno'
import { VIVO } from '../entorno/vivo'
import { pisoConFormacion } from '../formacion/Formacion'
import { crearCronometro, type Medida } from '../gpu/cronometro'
import { crearPingPong } from '../gpu/pingPong'
import { AIRE } from '../polvo/parche'
import { FLOOR_RADIUS, FLOOR_Y, PAPER_COLOR } from '../probeScene'
import { conElDiaDesdeAfuera } from '../dia/desdeAfuera'
import { MANCHA_EN_EL_PISO } from '../sombra/enElPiso'
import { PISO_EN_VIVO } from './enVivo'
import { PISO_VIVO, SIMULACION_GLSL, centroDeLaCelda, conPisoVivo, geometriaDelBloque, grillaDelPiso, type Grilla } from './bloques'

/**
 * [ESCENA 6] EL PISO VIVO — monta los bloques y corre la simulación (`bloques.ts` tiene el porqué).
 * [ESCENA 7] T5: encendido en el producto, el mar, sin scroll. Va después del rig y del entorno: lee la
 * cámara, el cursor, el pulso y la pose del logo de este cuadro. La simulación corre a PASO FIJO (1/120 s),
 * tantos pasos como el reloj pida: la misma ola a 30 que a 144 cuadros por segundo. Con movimiento
 * reducido el piso queda quieto (el mar parado en un instante).
 */

type VentanaDelBanco = Window & {
  __pisoDelBanco?: {
    bloques: number
    triangulos: number
    celdas: number
    medir: (pasos: number) => Promise<Medida>
    /** La altura dibujada más alta y la más baja, la presencia del cursor y cuántos pasos corrió el último cuadro. */
    estado: () => { maximo: number; minimo: number; presencia: number; cursor: number[]; pasos: number }
  }
}

interface PropsDelPiso {
  readonly calidad: NivelDeCalidad
  readonly quieto: boolean
}

/** ¿Hay piso vivo en esta carga? Los planos apoyados en el piso lo preguntan para esconderse. */
export function hayPisoVivo(): boolean {
  return entornoDeLaEscena().pisoVivo
}

export function PisoVivo(props: PropsDelPiso) {
  if (!hayPisoVivo()) return null
  return <PisoVivoPrendido {...props} />
}

/** Como mucho, cuántos pasos fijos se corren en un cuadro (un cuadro muy largo no se recupera entero). */
const PASOS_POR_CUADRO = 8

function PisoVivoPrendido({ calidad, quieto }: PropsDelPiso) {
  const radio = pisoConFormacion(calidad)?.radio ?? FLOOR_RADIUS
  const armado = useMemo(() => armar(grillaDelPiso(radio)), [radio])
  useEffect(() => () => armado.soltar(), [armado])
  const memoria = useRef({
    inicio: true,
    puntero: new THREE.Vector2(9, 9),
    presencia: 0,
    ultimoCursor: -Infinity,
    cursor: new THREE.Vector2(),
    rayo: new THREE.Raycaster(),
    plano: new THREE.Plane(new THREE.Vector3(0, 1, 0), -FLOOR_Y),
    punto: new THREE.Vector3(),
    reloj: Number.NaN,
    pasos: 0,
    principal: null as THREE.DirectionalLight | null,
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
        for (let k = 2; k < datos.length; k += 4) {
          maximo = Math.max(maximo, datos[k])
          minimo = Math.min(minimo, datos[k])
        }
        const m = memoria.current
        return { maximo, minimo, presencia: m.presencia, cursor: [m.cursor.x, m.cursor.y], pasos: m.pasos }
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
    const t = VIVO.uTiempo.value
    const g = armado.grilla
    const dt = Math.min(Math.max(delta, 0), 0.1)

    // El cursor: el punto del piso bajo el puntero; la presencia sube al moverlo y se apaga quieto.
    const movio = m.puntero.x < 5 && m.puntero.distanceToSquared(state.pointer) > 1e-8
    m.puntero.copy(state.pointer)
    if (movio) m.ultimoCursor = t
    m.rayo.setFromCamera(state.pointer, state.camera)
    const toca = m.rayo.ray.intersectPlane(m.plano, m.punto)
    if (toca !== null) m.cursor.set(toca.x / g.lado, toca.z / g.lado)
    const presente = !quieto && toca !== null && t - m.ultimoCursor < PISO_VIVO.cursor.quietoS
    m.presencia += ((presente ? 1 : 0) - m.presencia) * (1 - Math.exp(-dt / (presente ? 0.15 : 0.8)))

    // Los pasos fijos que pide el reloj de la escena (que se detiene con movimiento reducido).
    const paso = PISO_VIVO.onda.paso
    if (Number.isNaN(m.reloj) || t < m.reloj || t - m.reloj > 1) m.reloj = t - paso
    const s = armado.sim.material.uniforms
    let pasos = 0
    while (m.reloj + paso <= t + 1e-9 && pasos < PASOS_POR_CUADRO) {
      m.reloj += paso
      alPaso(s, {
        dt: paso,
        c2: ((PISO_VIVO.onda.velocidad * paso) / g.lado) ** 2,
        cursor: [m.cursor.x, m.cursor.y, PISO_VIVO.cursor.radio / g.lado, m.presencia],
        t: m.reloj,
        conLogo: AIRE.uLogoC.value.z > 0 && AIRE.uLogoC.value.w > 0 ? 1 : 0,
      })
      correr(armado, gl)
      pasos += 1
    }
    if (pasos === PASOS_POR_CUADRO) m.reloj = t
    m.pasos = pasos
    m.principal ??= laPrincipal(state.scene)
    alCuadro(armado, VIVO.uHaz.value, m.principal)
  })

  return <primitive object={armado.bloques} />
}

interface Paso {
  readonly dt: number
  readonly c2: number
  readonly cursor: readonly [number, number, number, number]
  readonly t: number
  readonly conLogo: number
}

function alPaso(s: Record<string, THREE.IUniform>, p: Paso): void {
  s.uDt.value = p.dt
  s.uC2.value = p.c2
  ;(s.uCursor.value as THREE.Vector4).set(...p.cursor)
  s.uTiempo.value = p.t
  s.uConLogo.value = p.conLogo
}

/** Un paso de la simulación (medido si el banco lo pidió). */
function correr(armado: ReturnType<typeof armar>, gl: THREE.WebGLRenderer): void {
  armado.cronometro.correr(gl, () => armado.sim.paso(gl))
  armado.uAlturas.value = armado.sim.estado()[0]
  // El polvo posado lee las mismas alturas (`enVivo.ts`).
  PISO_EN_VIVO.uPisoVivo.value = armado.uAlturas.value
  PISO_EN_VIVO.uGrillaDelPiso.value.set(armado.grilla.n, armado.grilla.lado, 1, 0)
}

function guardarElContexto(armado: ReturnType<typeof armar>, gl: THREE.WebGLRenderer): void {
  armado.gl.current = gl
}

/** La luz principal de la sala: la direccional más intensa (el rig la mueve con el arco, no la cambia). */
function laPrincipal(escena: THREE.Object3D): THREE.DirectionalLight | null {
  let principal: THREE.DirectionalLight | null = null
  escena.traverse((o) => {
    if (o instanceof THREE.DirectionalLight && (principal === null || o.intensity > principal.intensity)) principal = o
  })
  return principal
}

/** La luz principal, vista desde arriba, para el bisel de las tapas (la dirección hacia la luz en el piso). */
function alCuadro(armado: ReturnType<typeof armar>, haz: number, principal: THREE.DirectionalLight | null): void {
  armado.uHaz.value = haz
  if (principal !== null && principal.position.lengthSq() > 1e-6) armado.uLuzDelBisel.value.set(principal.position.x, principal.position.z).normalize()
}

function armar(grilla: Grilla) {
  const uAlturas: { value: THREE.Texture | null } = { value: null }
  const uHaz = { value: 0 }
  const uLuzDelBisel = { value: new THREE.Vector2(-0.6, 0.8) }
  const sim = crearPingPong(grilla.n, grilla.n, 1, SIMULACION_GLSL, {
    uDt: { value: PISO_VIVO.onda.paso },
    uC2: { value: 0 },
    uRadio: { value: grilla.radio / grilla.lado },
    uLado: { value: grilla.lado },
    uCursor: { value: new THREE.Vector4(9999, 9999, 1, 0) },
    uTiempo: { value: 0 },
    uAnillos: VIVO.uAnillos,
    uConLogo: { value: 0 },
    uLogoC: AIRE.uLogoC,
    uLogoP: AIRE.uLogoP,
    uLogoPalo: AIRE.uLogoPalo,
    uLogoInverso: AIRE.uLogoInverso,
  })
  uAlturas.value = sim.estado()[0]
  const material = conPisoVivo(new THREE.MeshStandardMaterial({ color: PAPER_COLOR, roughness: 0.94, metalness: 0 }), {
    uAlturas,
    uLado: { value: grilla.lado },
    uRadioDelPiso: { value: grilla.radio },
    uN: { value: grilla.n },
    uHaz,
    uLuzDelBisel,
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
    uLuzDelBisel,
    soltar: () => {
      sim.soltar()
      geometria.dispose()
      material.dispose()
      bloques.dispose()
    },
  }
}
