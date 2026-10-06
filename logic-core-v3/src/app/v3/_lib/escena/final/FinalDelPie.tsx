'use client'

import { useFrame, useLoader } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from 'react'
import { SVGLoader } from 'three-stdlib'
import * as THREE from 'three'

import { VIVO } from '../entorno/vivo'
import { hayBanco } from '../entorno'
import { FLOOR_Y, PROBE_SVG_SCALE } from '../probeScene'
import type { ProbeStatsStore } from '../probeStore'
import { CAMARA_SIN_EL_MOUSE } from '../sinElMouse'
import { FINAL_EN_EL_PISO } from './enElPiso'
import { crearElVapor, pasoDelVapor, vaporQuieto, type EstadoDelVapor, type Vapor } from './vapor'
import { viajeEnCurso } from '../viaje'
import { EN_VIVO, FINAL_DEL_PIE, RELOJ_DEL_FINAL, acostado, aterrizaje, blancoDelFinal, camaraDelFinal, pasoDelReloj, poseDelLogo, relojDelQuieto, relojQuieto, segundosDelFinal, subida, type RelojDelFinal, type TamanoDelLogo } from './recorridoDelFinal'

/**
 * [CIERRE] 3 · EL FINAL DEL PIE EN LA ESCENA — va justo después del rig (`OrbitRig` pone la cámara del recorrido en la pose
 * E y el balanceo del logo; acá se les suma el final, en el mismo cuadro y antes que todo lo que los lee: el piso, el aire,
 * los títulos, las piezas del pie). Desde 1024 y con movimiento (`ProbeStage`). Lo que hace y el porqué, en `recorridoDelFinal.ts`.
 */
interface Props {
  readonly logoGroupRef: RefObject<THREE.Group | null>
  readonly stats: ProbeStatsStore
}

type VentanaDelBanco = Window & { __finalDelBanco?: () => { fin: number; camara: number; giro: number; aleja: number; golpes: number; particulas: boolean; logo: number[] } }

const SELECTOR_DE_LA_COLA = '[data-pieza="cola-del-final"]'

/** Lo del final que vive entre cuadros: lo arma `FinalDelPie` una vez y lo usa `alCuadroDelFinal`. */
interface EstadoDelFinal {
  cola: Element | null
  /** [EL ENCASTRE] 2A · el reloj de `fin`. */
  readonly reloj: RelojDelFinal
  scroll: number
  sinScrollS: number
  quietoS: number
  golpeEn: number
  golpes: number
  antes: number
  aplicado: boolean
  readonly puntero: THREE.Vector2
  punteroEn: number
  presencia: number
  readonly rayo: THREE.Raycaster
  readonly plano: THREE.Plane
  readonly punto: THREE.Vector3
  readonly pose: { centro: THREE.Vector3; rotacionX: number }
  readonly sacudon: THREE.Vector3
  haz: THREE.Object3D | null
  /** [EL ENCASTRE] 2C · el vapor (reemplaza a la explosión de CIERRE) y lo que recuerda. */
  readonly vapor: Vapor
  readonly estadoDelVapor: EstadoDelVapor
}

function crearElEstado(contorno: readonly THREE.Vector3[]): EstadoDelFinal {
  return {
    cola: null,
    reloj: relojQuieto(),
    scroll: Number.NaN,
    sinScrollS: 0,
    quietoS: 0,
    golpeEn: Number.NaN,
    golpes: 0,
    antes: 0,
    aplicado: false,
    puntero: new THREE.Vector2(9, 9),
    punteroEn: -Infinity,
    presencia: 0,
    rayo: new THREE.Raycaster(),
    plano: new THREE.Plane(new THREE.Vector3(0, 1, 0), -FLOOR_Y),
    punto: new THREE.Vector3(),
    pose: { centro: new THREE.Vector3(), rotacionX: 0 },
    sacudon: new THREE.Vector3(),
    haz: null,
    // El contorno del logo acostado, en el piso: (x, −y) del grupo del logo.
    vapor: crearElVapor(contorno.map((p) => new THREE.Vector2(p.x, -p.y)), Math.random),
    estadoDelVapor: vaporQuieto(),
  }
}

/** El contorno del logo en su grupo (como lo arma `ProbeLogo`: centrado en su caja, la escala y el SVG dado vuelta). */
function contornoDelLogo(svg: { readonly paths: readonly { toShapes: (b: boolean) => THREE.Shape[] }[] }): THREE.Vector3[] {
  const puntos = svg.paths.flatMap((p) => p.toShapes(true)).flatMap((f) => [f.extractPoints(12).shape, ...f.extractPoints(12).holes])
  const caja = new THREE.Box2()
  for (const lista of puntos) for (const q of lista) caja.expandByPoint(q)
  const c = caja.getCenter(new THREE.Vector2())
  const todos = puntos.flat()
  const paso = Math.max(1, Math.floor(todos.length / 360))
  return todos.filter((_, k) => k % paso === 0).map((q) => new THREE.Vector3((q.x - c.x) * PROBE_SVG_SCALE, -(q.y - c.y) * PROBE_SVG_SCALE, 0))
}

/** Lo que el final deja como estaba: el logo en su lugar, el haz, y el piso sin final. */
function soltarElFinal(s: EstadoDelFinal, logo: THREE.Object3D | null): void {
  logo?.position.set(0, 0, 0)
  if (s.haz !== null) s.haz.visible = true
  EN_VIVO.camara = 0
  FINAL_EN_EL_PISO.uVibraDelFinal.value = 0
  FINAL_EN_EL_PISO.uCursorDelFinal.value.w = 0
  s.vapor.puntos.visible = false
  s.aplicado = false
}

export function FinalDelPie({ logoGroupRef, stats }: Props) {
  const svg = useLoader(SVGLoader, '/logodevelOP.svg')
  const contorno = useMemo(() => contornoDelLogo(svg), [svg])
  const grupo = useRef<THREE.Group>(null)
  const m = useRef<EstadoDelFinal | null>(null)

  // Se arma al montarse (las partículas, al grupo); al irse (abajo de 1024, o con movimiento reducido), todo como estaba.
  useLayoutEffect(() => {
    const g = grupo.current
    const logo = logoGroupRef.current
    if (g === null) return undefined
    const estado = crearElEstado(contorno)
    m.current = estado
    g.add(estado.vapor.puntos)
    return () => {
      g.remove(estado.vapor.puntos)
      soltarElFinal(estado, logo)
      EN_VIVO.fin = 0
      EN_VIVO.pegadoDesde = Number.POSITIVE_INFINITY
      FINAL_EN_EL_PISO.uGolpe.value.w = 0
      estado.vapor.soltar()
      m.current = null
    }
  }, [contorno, logoGroupRef])

  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    ventana.__finalDelBanco = () => ({ fin: EN_VIVO.fin, camara: EN_VIVO.camara, giro: EN_VIVO.giro, aleja: EN_VIVO.aleja, golpes: m.current?.golpes ?? 0, particulas: m.current?.vapor.puntos.visible ?? false, logo: logoGroupRef.current ? [...logoGroupRef.current.position.toArray(), logoGroupRef.current.rotation.x] : [] })
    return () => {
      delete ventana.__finalDelBanco
    }
  }, [logoGroupRef])

  useFrame((state, delta) => {
    if (m.current !== null) alCuadroDelFinal(m.current, state, delta, logoGroupRef.current, { alto: stats.current.logoH || 4.78, espesor: stats.current.logoD || 0.56 })
  })

  return <group ref={grupo} name="final del pie" />
}

interface CuadroDeLaEscena {
  readonly camera: THREE.Camera
  readonly scene: THREE.Scene
  readonly pointer: THREE.Vector2
  readonly viewport: { readonly dpr: number }
}

/** Un cuadro del final: la cola, el reloj del quieto, el logo, el golpe, la cámara y el piso. */
function alCuadroDelFinal(s: EstadoDelFinal, state: CuadroDeLaEscena, delta: number, logo: THREE.Group | null, tamano: TamanoDelLogo): void {
  const dt = Math.min(Math.max(delta, 0), 0.1)
  const t = VIVO.uTiempo.value
  // 1 · [EL ENCASTRE] 2A · el reloj: arranca solo al llegar al pie (pegado), el scroll hacia abajo lo adelanta y un gesto
  // hacia arriba (o salir del pie, o un viaje del menú) lo revierte.
  s.cola ??= document.querySelector(SELECTOR_DE_LA_COLA)
  const caja = s.cola?.getBoundingClientRect()
  EN_VIVO.pegadoDesde = caja !== undefined && caja.height > 0 ? caja.top + window.scrollY - window.innerHeight : Number.POSITIVE_INFINITY
  const enElPie = window.scrollY >= EN_VIVO.pegadoDesde - 2
  pasoDelReloj(s.reloj, enElPie, window.scrollY, caja?.height ?? 0, dt, viajeEnCurso() !== null, EN_VIVO.pegadoDesde)
  EN_VIVO.fin = s.reloj.fin
  const fin = EN_VIVO.fin
  s.sinScrollS = window.scrollY === s.scroll ? s.sinScrollS + dt : 0
  s.scroll = window.scrollY
  s.quietoS = relojDelQuieto(s.quietoS, fin > 0.995, s.sinScrollS, dt, EN_VIVO)
  // [EL ENCASTRE] 2C · el vapor: se arma con el final en cero (por eso antes de la salida temprana) y sigue mientras se
  // hunde (aunque `fin` ya volvió a 0).
  pasoDelVapor(s.estadoDelVapor, segundosDelFinal(fin), s.reloj.direccion > 0, dt)
  const activo = fin > 0 || EN_VIVO.giro !== 0 || EN_VIVO.aleja !== 0 || s.estadoDelVapor.reloj > 0
  if (!activo) {
    if (s.aplicado) soltarElFinal(s, logo)
    s.antes = fin
    return
  }
  s.aplicado = true
  // El techo del haz (el de la noche, a la altura de sus estrellas): la cámara del final sube por encima y lo vería
  // desde arriba, un anillo de papel que tapa la sala. Es de día: mientras dura el final, el haz entero no se dibuja.
  s.haz ??= state.scene.getObjectByName('haz') ?? null
  if (s.haz !== null) s.haz.visible = false

  // 2 · El logo: [EL ENCASTRE] 2B · se acuesta en su lugar (sobre su centro), cae al piso y se encastra (el balanceo del rig
  // se apaga mientras tanto).
  const k = acostado(fin)
  poseDelLogo(fin, tamano, s.pose)
  if (logo !== null) {
    logo.position.copy(s.pose.centro)
    logo.rotation.x = logo.rotation.x * (1 - k) + s.pose.rotacionX
    logo.rotation.y *= 1 - k
    logo.updateMatrixWorld()
  }

  // 3 · El golpe: al tocar el piso bajando (una vez por bajada), la onda. [EL ENCASTRE] 2C · y el vapor, que sopla mientras
  // se acuesta y se queda posado en el piso; al revertir se hunde (`vapor.ts`).
  const golpe = aterrizaje(tamano) / RELOJ_DEL_FINAL.duracionS
  if (s.antes < golpe && fin >= golpe) {
    s.golpeEn = t
    s.golpes += 1
    FINAL_EN_EL_PISO.uGolpe.value.set(t, s.pose.centro.x, s.pose.centro.z, 1)
  }
  s.antes = fin
  const desdeElGolpe = t - s.golpeEn
  s.vapor.uniformes.uT.value = s.estadoDelVapor.reloj
  s.vapor.uniformes.uHundir.value = s.estadoDelVapor.hundir
  s.vapor.uniformes.uPixel.value = state.viewport.dpr
  s.vapor.puntos.visible = s.estadoDelVapor.reloj > 0

  // 4 · La cámara (la viva y la de sin el mouse, con la que se colocan las piezas del pie): sube en paralelo hasta mirarlo
  // desde arriba, centrada en el logo (su blanco baja al piso con la caída).
  const sube = subida(fin)
  EN_VIVO.camara = sube
  blancoDelFinal(fin, EN_VIVO.blanco)
  const sacude = Number.isFinite(desdeElGolpe) && desdeElGolpe < 4 * FINAL_DEL_PIE.sacudon.s
  if (sacude) {
    const a = FINAL_DEL_PIE.sacudon.amplitud * Math.exp(-desdeElGolpe / FINAL_DEL_PIE.sacudon.s)
    s.sacudon.set(Math.sin(desdeElGolpe * 53) * a, Math.sin(desdeElGolpe * 71 + 1) * a, Math.sin(desdeElGolpe * 61 + 2) * a)
  }
  camaraDelFinal(state.camera, sube, EN_VIVO.blanco, EN_VIVO.giro, EN_VIVO.aleja, sacude ? s.sacudon : null)
  camaraDelFinal(CAMARA_SIN_EL_MOUSE, sube, EN_VIVO.blanco, EN_VIVO.giro, EN_VIVO.aleja, null)

  // 5 · El piso: después del golpe vibra y se oscurece debajo del mouse (con el puntero que se movió hace poco).
  const vibra = Math.min(1, Math.max(0, (fin - golpe) / 0.12))
  FINAL_EN_EL_PISO.uVibraDelFinal.value = vibra
  if (s.puntero.distanceToSquared(state.pointer) > 1e-8) s.punteroEn = t
  s.puntero.copy(state.pointer)
  s.rayo.setFromCamera(state.pointer, state.camera)
  const toca = s.rayo.ray.intersectPlane(s.plano, s.punto)
  const presente = toca !== null && t - s.punteroEn < 2.5
  s.presencia += ((presente ? 1 : 0) - s.presencia) * (1 - Math.exp(-dt / (presente ? 0.12 : 0.7)))
  if (toca !== null) FINAL_EN_EL_PISO.uCursorDelFinal.value.set(s.punto.x, s.punto.z, 0, vibra * s.presencia)
  else FINAL_EN_EL_PISO.uCursorDelFinal.value.w = 0
}
