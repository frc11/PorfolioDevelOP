import * as THREE from 'three'

import { VIVO } from '../entorno/vivo'
import { FLOOR_Y } from '../probeScene'
import { CAMARA_SIN_EL_MOUSE } from '../sinElMouse'
import { viajeEnCurso } from '../viaje'
import { FINAL_EN_EL_PISO } from './enElPiso'
import { crearElPozo } from './hueco'
import { crearElVapor, pasoDelVapor, vaporQuieto, type EstadoDelVapor, type Vapor } from './vapor'
import {
  EN_VIVO,
  FINAL_DEL_PIE,
  RELOJ_DEL_FINAL,
  acostado,
  apertura,
  aterrizaje,
  blancoDelFinal,
  calma,
  camaraDelFinal,
  pasoDelReloj,
  poseDelLogo,
  relojDelQuieto,
  relojQuieto,
  sacudonDeLaPresion,
  segundosDelFinal,
  subida,
  temblorDelLogo,
  type RelojDelFinal,
  type TamanoDelLogo,
} from './recorridoDelFinal'

/**
 * [EL ENCASTRE] · EL CUADRO DEL FINAL — lo que `FinalDelPie` corre en cada cuadro, aparte del componente (para que ninguno
 * pase las 300 líneas): el reloj, el logo, el hueco, el vapor, el golpe, la cámara y el piso. El porqué de cada cosa, en
 * `recorridoDelFinal.ts` (los tiempos), `hueco.ts`, `vapor.ts` y `enElPiso.ts`.
 */

const SELECTOR_DE_LA_COLA = '[data-pieza="cola-del-final"]'

/** Lo del final que vive entre cuadros: lo arma `FinalDelPie` una vez y lo usa `alCuadroDelFinal`. */
export interface EstadoDelFinal {
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
  readonly sacudonChico: THREE.Vector3
  readonly temblor: THREE.Vector3
  haz: THREE.Object3D | null
  /** [EL ENCASTRE] 2C · el vapor (reemplaza a la explosión de CIERRE) y lo que recuerda. */
  readonly vapor: Vapor
  readonly estadoDelVapor: EstadoDelVapor
  /** [EL ENCASTRE] 2D · el pozo debajo del hueco. */
  readonly pozo: ReturnType<typeof crearElPozo>
}

/** `contorno`: el del logo acostado en el piso (x, z); `formas`: las del logo en su plano (`hueco.ts`). */
export function crearElEstado(contorno: readonly THREE.Vector2[], formas: readonly THREE.Shape[], espesor: number): EstadoDelFinal {
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
    sacudonChico: new THREE.Vector3(),
    temblor: new THREE.Vector3(),
    haz: null,
    vapor: crearElVapor(contorno, Math.random),
    estadoDelVapor: vaporQuieto(),
    pozo: crearElPozo(formas, espesor),
  }
}

/** Lo que el final deja como estaba: el logo en su lugar, el haz, y el piso sin final. */
export function soltarElFinal(s: EstadoDelFinal, logo: THREE.Object3D | null): void {
  logo?.position.set(0, 0, 0)
  if (s.haz !== null) s.haz.visible = true
  EN_VIVO.camara = 0
  const p = FINAL_EN_EL_PISO
  p.uVibraDelFinal.value = 0
  p.uCursorDelFinal.value.w = 0
  p.uApertura.value = 0
  p.uCalmaDelFinal.value = 0
  p.uSinMancha.value = 0
  s.vapor.puntos.visible = false
  s.pozo.grupo.visible = false
  s.aplicado = false
}

export interface CuadroDeLaEscena {
  readonly camera: THREE.Camera
  readonly scene: THREE.Scene
  readonly pointer: THREE.Vector2
  readonly viewport: { readonly dpr: number }
}

/** Un cuadro del final: la cola, el reloj del quieto, el logo, el hueco, el golpe, el vapor, la cámara y el piso. */
export function alCuadroDelFinal(s: EstadoDelFinal, state: CuadroDeLaEscena, delta: number, logo: THREE.Group | null, tamano: TamanoDelLogo): void {
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

  // 2 · El logo: [EL ENCASTRE] 2B · se acuesta en su lugar (sobre su centro), cae justo en el hueco y [2D] se hunde a
  // presión, temblando mientras resiste (el balanceo del rig se apaga mientras tanto).
  const k = acostado(fin)
  poseDelLogo(fin, tamano, s.pose)
  if (logo !== null) {
    logo.position.copy(s.pose.centro).add(temblorDelLogo(fin, tamano, s.temblor))
    logo.rotation.x = logo.rotation.x * (1 - k) + s.pose.rotacionX
    logo.rotation.y *= 1 - k
    logo.updateMatrixWorld()
  }
  // [EL ENCASTRE] 2D · el hueco se abre cuando el logo está por llegar; el mar se calma a su alrededor; la mancha se va.
  const piso = FINAL_EN_EL_PISO
  piso.uApertura.value = apertura(fin)
  piso.uCalmaDelFinal.value = calma(fin)
  piso.uSinMancha.value = EN_VIVO.camara
  s.pozo.grupo.visible = piso.uApertura.value > 0

  // 3 · El golpe: al tocar el piso bajando (una vez por bajada), la onda. [EL ENCASTRE] 2C · y el vapor, que sopla mientras
  // se acuesta y se queda posado en el piso; al revertir se hunde (`vapor.ts`).
  const golpe = aterrizaje(tamano) / RELOJ_DEL_FINAL.duracionS
  if (s.antes < golpe && fin >= golpe) {
    s.golpeEn = t
    s.golpes += 1
    piso.uGolpe.value.set(t, s.pose.centro.x, s.pose.centro.z, 1)
  }
  s.antes = fin
  const desdeElGolpe = t - s.golpeEn
  s.vapor.uniformes.uT.value = s.estadoDelVapor.reloj
  s.vapor.uniformes.uHundir.value = s.estadoDelVapor.hundir
  s.vapor.uniformes.uPixel.value = state.viewport.dpr
  s.vapor.puntos.visible = s.estadoDelVapor.reloj > 0

  // 4 · La cámara (la viva y la de sin el mouse, con la que se colocan las piezas del pie): sube en paralelo hasta mirarlo
  // desde arriba, centrada en el logo (su blanco baja al piso con la caída); cada vez que el encastre cede, un sacudón chico.
  const sube = subida(fin)
  EN_VIVO.camara = sube
  blancoDelFinal(fin, EN_VIVO.blanco)
  s.sacudon.copy(sacudonDeLaPresion(fin, tamano, s.sacudonChico))
  if (Number.isFinite(desdeElGolpe) && desdeElGolpe < 4 * FINAL_DEL_PIE.sacudon.s) {
    const a = FINAL_DEL_PIE.sacudon.amplitud * Math.exp(-desdeElGolpe / FINAL_DEL_PIE.sacudon.s)
    s.sacudon.x += Math.sin(desdeElGolpe * 53) * a
    s.sacudon.y += Math.sin(desdeElGolpe * 71 + 1) * a
    s.sacudon.z += Math.sin(desdeElGolpe * 61 + 2) * a
  }
  camaraDelFinal(state.camera, sube, EN_VIVO.blanco, EN_VIVO.giro, EN_VIVO.aleja, s.sacudon.lengthSq() > 0 ? s.sacudon : null)
  camaraDelFinal(CAMARA_SIN_EL_MOUSE, sube, EN_VIVO.blanco, EN_VIVO.giro, EN_VIVO.aleja, null)

  // 5 · El piso: después del golpe vibra y se oscurece debajo del mouse (con el puntero que se movió hace poco).
  const vibra = Math.min(1, Math.max(0, (fin - golpe) / 0.12))
  piso.uVibraDelFinal.value = vibra
  if (s.puntero.distanceToSquared(state.pointer) > 1e-8) s.punteroEn = t
  s.puntero.copy(state.pointer)
  s.rayo.setFromCamera(state.pointer, state.camera)
  const toca = s.rayo.ray.intersectPlane(s.plano, s.punto)
  const presente = toca !== null && t - s.punteroEn < 2.5
  s.presencia += ((presente ? 1 : 0) - s.presencia) * (1 - Math.exp(-dt / (presente ? 0.12 : 0.7)))
  if (toca !== null) piso.uCursorDelFinal.value.set(s.punto.x, s.punto.z, 0, vibra * s.presencia)
  else piso.uCursorDelFinal.value.w = 0
}
