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
import { conElAmanecer } from '../amanecer/luz'
import { MANCHA_EN_EL_PISO } from '../sombra/enElPiso'
import { SOMBRA_EN_VIVO } from '../sombra/delLogo'
import { PISO_EN_VIVO } from './enVivo'
import { PISO_VIVO, SIMULACION_GLSL, centroDeLaCelda, conPisoVivo, geometriaDelBloque, grillaDelPiso, type Grilla } from './bloques'
import { ORDEN_DE_LA_GRILLA, armarLosOrdenes, ponerElOrden, profundidadEstricta, sectorDe } from './ordenDeLosBloques'

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
    /** [ESCENA 9] T4 · los bloques de adelante hacia atrás (o en el orden de la grilla) y la profundidad estricta. */
    orden: (prendido: boolean, estricta: boolean) => void
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
  // [ESCENA 8] T2: con la trama anclada al piso, el piso junto a la pared junta menos luz (el contacto).
  const conContacto = pisoConFormacion(calidad) !== undefined && entornoDeLaEscena().limite
  const armado = useMemo(() => armar(grillaDelPiso(radio), conContacto), [radio, conContacto])
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
    ojo: new THREE.Vector3(),
    reloj: Number.NaN,
    pasos: 0,
    principal: null as THREE.DirectionalLight | null,
    sector: 0,
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
      orden: (prendido, estricta) => {
        const o = armado.orden
        if (o === null) return
        o.apagado = !prendido
        ponerElOrden(armado.bloques, armado.celdas, o, prendido ? memoria.current.sector : ORDEN_DE_LA_GRILLA)
        profundidadEstricta(armado.bloques, estricta)
      },
    }
    return () => {
      delete ventana.__pisoDelBanco
    }
  }, [armado])

  useFrame((state, delta) => {
    const m = memoria.current
    const gl = state.gl
    guardarElContexto(armado, gl)
    // [ESCENA 9] T4 · los bloques de adelante hacia atrás desde la cámara: se reordenan sólo al cambiar de sector.
    state.camera.getWorldPosition(m.ojo)
    m.sector = sectorDe(m.ojo.x, m.ojo.z)
    if (armado.orden !== null && !armado.orden.apagado) ponerElOrden(armado.bloques, armado.celdas, armado.orden, m.sector)
    if (m.inicio) {
      armado.sim.llenar(gl, new THREE.Vector4(0, 0, 0, 1)) // una vez
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
      // [CALIDAD 1] B2: los uniforms del paso, sin un objeto ni un arreglo por paso.
      alPaso(s, paso, g.lado, m.cursor, m.presencia, m.reloj, state.camera.getWorldPosition(m.ojo))
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

/** Los uniforms de un paso. [CALIDAD 1] B2: en argumentos sueltos (antes, un objeto y un arreglo por paso). */
function alPaso(s: Record<string, THREE.IUniform>, paso: number, lado: number, cursor: THREE.Vector2, presencia: number, t: number, camara: THREE.Vector3): void {
  s.uDt.value = paso
  s.uC2.value = ((PISO_VIVO.onda.velocidad * paso) / lado) ** 2
  ;(s.uCursor.value as THREE.Vector4).set(cursor.x, cursor.y, PISO_VIVO.cursor.radio / lado, presencia)
  s.uTiempo.value = t
  s.uConLogo.value = AIRE.uLogoC.value.z > 0 && AIRE.uLogoC.value.w > 0 ? 1 : 0
  ;(s.uCamara.value as THREE.Vector3).copy(camara)
}

/** Un paso de la simulación (medido si el banco lo pidió). [CALIDAD 1] B2: con la pasada armada una vez. */
function correr(armado: ReturnType<typeof armar>, gl: THREE.WebGLRenderer): void {
  armado.cronometro.correr(gl, armado.pasar)
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

function armar(grilla: Grilla, conContacto: boolean) {
  const conSombra = entornoDeLaEscena().pruebas.sombraDelLogo
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
    uCamara: { value: new THREE.Vector3(0, 1e4, 0) },
  })
  uAlturas.value = sim.estado()[0]
  // [CALIDAD 1] B8: con dithering (ruido azul).
  const material = conPisoVivo(new THREE.MeshStandardMaterial({ color: PAPER_COLOR, roughness: 0.94, metalness: 0, dithering: true }), {
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
    // [ESCENA 9] T3 · la prueba de la sombra proyectada del logo.
    ...(conSombra ? SOMBRA_EN_VIVO : {}),
  }, conContacto, conSombra)
  // [ESCENA 7] T11: con la bandera, el amanecer y los cuadros de sol que entran por la trama.
  conElAmanecer(material, true)
  const geometria = geometriaDelBloque(grilla.lado)
  geometria.setAttribute('aCelda', new THREE.InstancedBufferAttribute(grilla.celdas, 2))
  const bloques = new THREE.InstancedMesh(geometria, material, grilla.cuantas)
  bloques.name = 'piso vivo'
  bloques.frustumCulled = false
  const matriz = new THREE.Matrix4()
  for (let k = 0; k < grilla.cuantas; k += 1) {
    const [x, z] = centroDeLaCelda(grilla.celdas[k * 2], grilla.celdas[k * 2 + 1], grilla)
    bloques.setMatrixAt(k, matriz.makeTranslation(x, FLOOR_Y, z))
  }
  bloques.instanceMatrix.needsUpdate = true
  // [ESCENA 9] T4 · los órdenes de adelante hacia atrás, uno por sector (`ordenDeLosBloques.ts`), armados una vez.
  const celdas = geometria.getAttribute('aCelda') as THREE.InstancedBufferAttribute
  const centros = new Float32Array(grilla.cuantas * 2)
  for (let k = 0; k < grilla.cuantas; k += 1) centros.set(centroDeLaCelda(grilla.celdas[k * 2], grilla.celdas[k * 2 + 1], grilla), k * 2)
  const orden = entornoDeLaEscena().ordenDelPiso ? armarLosOrdenes(centros, bloques.instanceMatrix.array as Float32Array, grilla.celdas) : null
  const gl = { current: null as THREE.WebGLRenderer | null }
  return {
    grilla,
    gl,
    celdas,
    orden,
    cronometro: crearCronometro(),
    sim,
    // [CALIDAD 1] B2: la pasada de la simulación, armada una vez (el cronómetro la corre en cada paso).
    pasar: (): void => {
      if (gl.current !== null) sim.paso(gl.current)
    },
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
