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
 * rig y del aire (lee la cámara, las conchas y la pose del logo de este cuadro). Sólo con `posarse` o
 * con 6b `remolinos`, y con el polvo parejo.
 *
 * Lleva su propio reloj (el de la escena, salvo que el banco pida cámara lenta) y la máquina de la
 * quietud de `posarse.ts`. El remolino del despertar sólo sopla si el polvo llegó a posarse (la
 * quietud duró más que `POSARSE.empiezaS`): mover el cursor después de una pausa corta no arma nada.
 *
 * 6b: lo que se lee como «el logo gira» es la cámara que orbita (en el mundo, el logo sólo se
 * balancea). Los remolinos salen de ese giro APARENTE: con la velocidad angular de la cámara alrededor
 * del logo, se sueltan vórtices en los bordes del logo, del lado de atrás del giro, alternando el
 * sentido, y se apagan en `FISICA.estela.vidaS`.
 */

interface PropsDeLaFisica {
  readonly rig: ProbeRigStore
  readonly quieto: boolean
  readonly dustGroupRef: RefObject<THREE.Group | null>
}

type VentanaDelBanco = Window & {
  __fisicaDelBanco?: { modos: () => number[]; camaraLenta: (escala: number) => void; remolinos: () => number[][]; corrimiento: () => number[]; medir: (pasos: number) => Promise<Medida> }
}

export function Fisica(props: PropsDeLaFisica) {
  const e = entornoDeLaEscena()
  if (!e.polvoParejo || (!e.posarse && !e.pruebas.remolinos)) return null
  return <FisicaPrendida {...props} />
}

interface Remolino {
  x: number
  z: number
  fuerza: number
  edad: number
}

function FisicaPrendida({ rig, quieto, dustGroupRef }: PropsDeLaFisica) {
  const { posarse } = entornoDeLaEscena()
  const { remolinos: conEstela } = entornoDeLaEscena().pruebas
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
    azimut: Number.NaN,
    giro: 0,
    proximo: 0,
    signo: 1,
    remolinos: [] as Remolino[],
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
        const cuenta = [0, 0, 0, 0, 0, 0]
        for (let k = 0; k < armado.cuantas; k += 1) cuenta[Math.min(5, Math.max(0, Math.round(datos[k * 4 + 3])))] += 1
        return cuenta
      },
      camaraLenta: (escala) => {
        memoria.current.escala = escala
      },
      remolinos: () => memoria.current.remolinos.map((r) => [r.x, r.z, r.fuerza, r.edad]),
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

    // 6b · el giro aparente del logo: la velocidad angular de la cámara a su alrededor.
    const azimut = Math.atan2(state.camera.position.x, state.camera.position.z)
    const dAzimut = Number.isNaN(m.azimut) ? 0 : Math.atan2(Math.sin(azimut - m.azimut), Math.cos(azimut - m.azimut))
    m.azimut = azimut
    m.giro += ((dtReal > 0 ? dAzimut / dtReal : 0) - m.giro) * (1 - Math.exp(-dtReal / 0.15))
    if (conEstela && !quieto) soltarRemolinos(m, state.camera, dt)

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
      remolinos: m.remolinos,
    })
    if (dt > 0) armado.cronometro.correr(gl, () => armado.sim.paso(gl))
    publicar(armado.sim.estado()[0])
  })

  return null
}

/** Suelta vórtices en los bordes del logo, del lado de atrás de su giro aparente, y envejece los vivos. */
function soltarRemolinos(m: { giro: number; proximo: number; signo: number; remolinos: Remolino[]; reloj: number }, camara: THREE.Camera, dt: number): void {
  const e = FISICA.estela
  for (const r of m.remolinos) r.edad += dt
  m.remolinos = m.remolinos.filter((r) => r.edad < e.vidaS)
  const giro = Math.abs(m.giro)
  if (giro < 0.08 || m.reloj < m.proximo || m.remolinos.length >= e.cuantos) return
  // Uno cada vez menos tiempo cuanto más rápido gira; alternando el borde y el sentido.
  m.proximo = m.reloj + Math.max(0.25, 0.7 - giro)
  // Los bordes del logo, vistos desde la cámara: a la derecha y a la izquierda de su eje.
  const derecha = new THREE.Vector3().setFromMatrixColumn(camara.matrixWorld, 0).setY(0).normalize()
  const lado = m.signo
  m.signo = -m.signo
  // Para la cámara el logo gira al revés que ella: el borde que avanza deja la estela atrás.
  const atras = derecha.clone().multiplyScalar(-Math.sign(m.giro) * 1.4)
  const borde = derecha.clone().multiplyScalar(lado * 3.2).add(atras)
  const [minima, maxima] = e.fuerza
  m.remolinos.push({ x: borde.x, z: borde.z, fuerza: lado * Math.sign(m.giro) * Math.min(maxima, minima + giro * 12), edad: 0 })
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
  readonly remolinos: readonly Remolino[]
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
  const vortices = u.uRemolinos.value as THREE.Vector4[]
  for (let i = 0; i < vortices.length; i += 1) {
    const r = p.remolinos[i]
    if (r === undefined) vortices[i].set(0, 0, 0, 0)
    else vortices[i].set(r.x, r.z, r.fuerza, r.edad)
  }
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
      uRemolinos: { value: Array.from({ length: FISICA.estela.cuantos }, () => new THREE.Vector4()) },
      uPisoVivo: PISO_EN_VIVO.uPisoVivo,
      uGrillaDelPiso: PISO_EN_VIVO.uGrillaDelPiso,
      uLogoC: AIRE.uLogoC,
      uLogoP: AIRE.uLogoP,
      uLogoPalo: AIRE.uLogoPalo,
      uLogo: AIRE.uLogo,
      uLogoInverso: AIRE.uLogoInverso,
      uAbrir: AIRE.uAbrir,
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
