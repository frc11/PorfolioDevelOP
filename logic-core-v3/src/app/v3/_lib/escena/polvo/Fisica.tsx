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
import { CAMPO_DEL_FLUJO, CAMPO_EN_VIVO, FLUJO_EN_VIVO, campoDeAPoco, contornoDeLaMalla, publicarElCampo, publicarElFlujo, type MallaDelLogo } from './campoDelLogo'
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
 * [ESCENA 7] T7: 6b se borró; el logo como obstáculo del aire que corre está en la simulación (`alrededorDelLogo`).
 *
 * [ESCENA 8] T5: arma una vez el campo de distancia de la malla real del logo (`campoDelLogo.ts`) cuando las
 * mallas ya están, fuera del cuadro (en un momento libre), y en cada cuadro le pasa a la simulación la pose del
 * logo del cuadro anterior (la velocidad de su superficie). [CALIDAD 1] A3: también el campo del flujo, en otro
 * momento libre; y como no hay pegado, ya no mide cuánto se mueve el logo. B1: los dos, DE A POCO (`hornearDeAPoco`).
 */

/** [CALIDAD 1] B1 · cuánto trabaja el horno en cada momento libre (ms): lejos de un cuadro largo. */
const PRESUPUESTO_DEL_HORNO_MS = 6

/**
 * [CALIDAD 1] B1 · hornea un campo en momentos libres, con presupuesto: ninguna tarea larga al cargar (antes, dos de
 * ~90 ms). Sin `requestIdleCallback`, en tareas sueltas del mismo presupuesto. Avisa con el campo terminado.
 */
function hornearDeAPoco(horno: ReturnType<typeof campoDeAPoco>, listo: (ms: number) => void): void {
  const t0 = performance.now()
  const seguir = (plazo?: IdleDeadline): void => {
    // Con la GPU al límite casi no hay momentos libres: si vence la espera, el presupuesto entero igual.
    const ms = plazo === undefined || plazo.didTimeout ? PRESUPUESTO_DEL_HORNO_MS : Math.min(PRESUPUESTO_DEL_HORNO_MS, Math.max(2, plazo.timeRemaining() - 1))
    if (horno.paso(ms)) listo(Math.round(performance.now() - t0))
    else if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(seguir, { timeout: 60 })
    else window.setTimeout(seguir, 0)
  }
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(seguir, { timeout: 60 })
  else window.setTimeout(seguir, 0)
}

interface PropsDeLaFisica {
  readonly rig: ProbeRigStore
  readonly quieto: boolean
  readonly dustGroupRef: RefObject<THREE.Group | null>
  /** [ESCENA 8] T5 · el grupo del logo: sus mallas son las del campo de distancia. */
  readonly logoGroupRef: RefObject<THREE.Group | null>
}

type VentanaDelBanco = Window & {
  __fisicaDelBanco?: { modos: () => number[]; camaraLenta: (escala: number) => void; corrimiento: () => number[]; medir: (pasos: number) => Promise<Medida>; campo: () => MedidaDelCampo | null; flujo: () => MedidaDelCampo | null }
}

export function Fisica(props: PropsDeLaFisica) {
  const e = entornoDeLaEscena()
  if (!e.polvoParejo || !e.posarse) return null
  return <FisicaPrendida {...props} />
}

/** [ESCENA 8] T5 · las mallas del logo en el espacio de su grupo (el que lee la simulación con `uLogoInverso`). */
function mallasDelLogo(grupo: THREE.Group): MallaDelLogo[] {
  grupo.updateMatrixWorld(true)
  const inversa = grupo.matrixWorld.clone().invert()
  const mallas: MallaDelLogo[] = []
  grupo.traverse((o) => {
    if (!(o instanceof THREE.Mesh) || !(o.geometry instanceof THREE.BufferGeometry)) return
    const posicion = o.geometry.getAttribute('position')
    if (posicion === undefined) return
    mallas.push({ posiciones: posicion.array, indices: o.geometry.index?.array ?? null, matriz: inversa.clone().multiply(o.matrixWorld) })
  })
  return mallas
}

/** Lo que el banco lee de un campo horneado: cuánto tardó, sus celdas y los tramos del contorno. */
interface MedidaDelCampo {
  readonly ms: number
  readonly celdas: number[]
  readonly tramos: number
}

function FisicaPrendida({ rig, quieto, dustGroupRef, logoGroupRef }: PropsDeLaFisica) {
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
    // [ESCENA 8] T5: el campo del logo (se arma una vez) y la pose del logo del cuadro anterior. [CALIDAD 1] A3: y el del flujo.
    campo: 'falta' as 'falta' | 'armando' | 'listo',
    medidaDelCampo: null as MedidaDelCampo | null,
    medidaDelFlujo: null as MedidaDelCampo | null,
    textura: null as THREE.Data3DTexture | null,
    texturaDelFlujo: null as THREE.Data3DTexture | null,
    logoAntes: null as THREE.Matrix4 | null,
  })

  // [ESCENA 8] T5: al desmontarse, el campo se libera y la simulación vuelve a no tener logo.
  useEffect(
    () => () => {
      memoria.current.textura?.dispose()
      memoria.current.texturaDelFlujo?.dispose()
      CAMPO_EN_VIVO.uCampoDelLogo.value = null
      CAMPO_EN_VIVO.uHayCampo.value = 0
      FLUJO_EN_VIVO.uFlujoDelLogo.value = null
      FLUJO_EN_VIVO.uHayFlujo.value = 0
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
        // Aire, cayendo, en el piso, sobre el logo, deslizando y levantada ([CALIDAD 1] A3: la pegada se borró).
        const cuenta = [0, 0, 0, 0, 0, 0]
        for (let k = 0; k < armado.cuantas; k += 1) cuenta[Math.min(5, Math.max(0, Math.round(datos[k * 4 + 3])))] += 1
        return cuenta
      },
      camaraLenta: (escala) => {
        memoria.current.escala = escala
      },
      medir: (pasos) => armado.cronometro.pedir(pasos),
      campo: () => memoria.current.medidaDelCampo,
      flujo: () => memoria.current.medidaDelFlujo,
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
    // [ESCENA 8] T5: el campo de la malla real, una vez, en un momento libre (no en este cuadro).
    const grupoDelLogo = logoGroupRef.current
    if (m.campo === 'falta' && grupoDelLogo !== null) {
      const mallas = mallasDelLogo(grupoDelLogo)
      if (mallas.length > 0) {
        m.campo = 'armando'
        // [CALIDAD 1] B1: el fino primero (el choque) y después el del flujo, cada uno de a poco. El `ms` es de punta a
        // punta (con las esperas entre momentos libres), no de trabajo.
        const empezar = (): void => {
          const contorno = contornoDeLaMalla(mallas)
          const tramos = contorno.tramos.length / 4
          const fino = campoDeAPoco(contorno)
          hornearDeAPoco(fino, (ms) => {
            const campo = fino.campo()
            m.textura = publicarElCampo(campo)
            m.medidaDelCampo = { ms, celdas: [...campo.n], tramos }
            m.campo = 'listo'
            const flujo = campoDeAPoco(contorno, CAMPO_DEL_FLUJO)
            hornearDeAPoco(flujo, (ms2) => {
              const f = flujo.campo()
              m.texturaDelFlujo = publicarElFlujo(f)
              m.medidaDelFlujo = { ms: ms2, celdas: [...f.n], tramos }
            })
          })
        }
        if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(empezar, { timeout: 1500 })
        else window.setTimeout(empezar, 0)
      }
    }
    const dustGroup = dustGroupRef.current
    if (dustGroup === null) return
    const dtReal = Math.min(delta, 1 / 30)
    // [ESCENA 8] T5: la pose del logo del cuadro anterior (la velocidad de su superficie).
    const logoAntes = m.logoAntes ?? AIRE.uLogo.value.clone()
    const antesDeEste = m.logoAntes === null ? logoAntes : m.logoAntes.clone()
    m.logoAntes = (m.logoAntes ?? new THREE.Matrix4()).copy(AIRE.uLogo.value)
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
      logoAntes: antesDeEste,
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
  /** [ESCENA 8] T5 · la pose del logo del cuadro anterior. */
  readonly logoAntes: THREE.Matrix4
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
  ;(u.uLogoAntes.value as THREE.Matrix4).copy(p.logoAntes)
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
      // [ESCENA 8] T5: la pose del logo del cuadro anterior y el campo de la malla real. [CALIDAD 1] A3: y el del flujo.
      uLogoAntes: { value: new THREE.Matrix4() },
      ...CAMPO_EN_VIVO,
      ...FLUJO_EN_VIVO,
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
