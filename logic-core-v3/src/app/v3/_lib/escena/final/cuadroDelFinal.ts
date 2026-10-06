import * as THREE from 'three'

import { VIVO } from '../entorno/vivo'
import { FLOOR_Y } from '../probeScene'
import { CAMARA_SIN_EL_MOUSE } from '../sinElMouse'
import { viajeEnCurso } from '../viaje'
import { FINAL_EN_EL_PISO } from './enElPiso'
import { crearElPozo } from './hueco'
import { apagarElRastro, pasoDelRastro, rastroQuieto, type EstadoDelRastro } from './rastro'
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
  poder,
  poseDelLogo,
  relojDelQuieto,
  relojQuieto,
  sacudonDeLaPresion,
  subida,
  temblorDelLogo,
  type RelojDelFinal,
  type TamanoDelLogo,
} from './recorridoDelFinal'

/**
 * [EL ENCASTRE] · EL CUADRO DEL FINAL — lo que `FinalDelPie` corre en cada cuadro, aparte del componente (para que ninguno
 * pase las 300 líneas): el reloj, el logo, el hueco, el golpe, la cámara y el piso. El porqué de cada cosa, en
 * `recorridoDelFinal.ts` (los tiempos), `hueco.ts` y `enElPiso.ts`. [RETOQUE DEL ENCASTRE] 1A · el vapor se fue entero.
 */

const SELECTOR_DE_LA_COLA = '[data-pieza="cola-del-final"]'

/** Lo del final que vive entre cuadros: lo arma `FinalDelPie` una vez y lo usa `alCuadroDelFinal`. */
export interface EstadoDelFinal {
  cola: Element | null
  /** [EL ENCASTRE] 2A · el reloj de `fin`. */
  readonly reloj: RelojDelFinal
  scroll: number
  sinScrollS: number
  /** [EL ENCASTRE] 2G · cuánto hace que el final está entero (s). */
  enteroS: number
  quietoS: number
  golpeEn: number
  golpes: number
  /** [EL ENCASTRE] 2E · cuándo tocó el piso (el golpecito), en el reloj de la escena. */
  tocoEn: number
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
  /** [EL ENCASTRE] 2D · el pozo debajo del hueco. */
  readonly pozo: ReturnType<typeof crearElPozo>
  /** [EL ENCASTRE] 2F · el rastro del mouse en el piso. */
  readonly rastro: EstadoDelRastro
}

/** `formas`: las del logo en su plano (`hueco.ts`). */
export function crearElEstado(formas: readonly THREE.Shape[], espesor: number): EstadoDelFinal {
  return {
    cola: null,
    reloj: relojQuieto(),
    scroll: Number.NaN,
    sinScrollS: 0,
    enteroS: 0,
    quietoS: 0,
    golpeEn: Number.NaN,
    golpes: 0,
    tocoEn: Number.NaN,
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
    pozo: crearElPozo(formas, espesor),
    rastro: rastroQuieto(),
  }
}

/** Lo que el final deja como estaba: el logo en su lugar, el haz, y el piso sin final. */
export function soltarElFinal(s: EstadoDelFinal, logo: THREE.Object3D | null): void {
  logo?.position.set(0, 0, 0)
  if (s.haz !== null) s.haz.visible = true
  EN_VIVO.camara = 0
  const p = FINAL_EN_EL_PISO
  apagarElRastro(p.uRastro.value, s.rastro)
  p.uApertura.value = 0
  p.uCalmaDelFinal.value = 0
  p.uSinMancha.value = 0
  p.uPoder.value = 0
  s.pozo.grupo.visible = false
  s.aplicado = false
}

export interface CuadroDeLaEscena {
  readonly camera: THREE.Camera
  readonly scene: THREE.Scene
  readonly pointer: THREE.Vector2
}

/** Un cuadro del final: la cola, el reloj del quieto, el logo, el hueco, el golpe, la cámara y el piso. */
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
  // [EL ENCASTRE] 2G · el quieto espera también al final entero (arranca solo: sin esto ya llevaba 1,4 s sin scroll al terminar).
  s.enteroS = fin > 0.995 ? s.enteroS + dt : 0
  s.quietoS = relojDelQuieto(s.quietoS, fin > 0.995, Math.min(s.sinScrollS, s.enteroS), dt, EN_VIVO)
  const activo = fin > 0 || EN_VIVO.giro !== 0 || EN_VIVO.aleja !== 0
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

  // 3 · [EL ENCASTRE] 2E · El golpe: al quedar al ras (una vez por bajada) se libera el poder: su pulso corre por el piso,
  // centrado en el logo, y las juntas de alrededor se encienden. Al tocar el piso, sólo un golpecito.
  const golpe = FINAL_DEL_PIE.presion.hastaS / RELOJ_DEL_FINAL.duracionS
  const aterriza = aterrizaje(tamano) / RELOJ_DEL_FINAL.duracionS
  if (s.antes < aterriza && fin >= aterriza) s.tocoEn = t
  if (s.antes < golpe && fin >= golpe) {
    s.golpeEn = t
    s.golpes += 1
    piso.uGolpe.value.set(t, 0, 0, 1)
  }
  s.antes = fin
  piso.uPoder.value = poder(fin)
  const desdeElGolpe = t - s.golpeEn

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
  const desdeQueToco = t - s.tocoEn
  if (Number.isFinite(desdeQueToco) && desdeQueToco < 0.4) s.sacudon.y += FINAL_DEL_PIE.poder.golpecito * Math.exp(-desdeQueToco / 0.08) * Math.sin(desdeQueToco * 90)
  camaraDelFinal(state.camera, sube, EN_VIVO.blanco, EN_VIVO.giro, EN_VIVO.aleja, s.sacudon.lengthSq() > 0 ? s.sacudon : null)
  camaraDelFinal(CAMARA_SIN_EL_MOUSE, sube, EN_VIVO.blanco, EN_VIVO.giro, EN_VIVO.aleja, null)

  // 5 · [EL ENCASTRE] 2F · El piso bajo el mouse (con el poder, y el puntero que se movió hace poco): deja un rastro que
  // levanta los bloques y enciende sus rendijas, y que se apaga con inercia cuando el mouse se va (`rastro.ts`).
  if (s.puntero.distanceToSquared(state.pointer) > 1e-8) s.punteroEn = t
  s.puntero.copy(state.pointer)
  s.rayo.setFromCamera(state.pointer, state.camera)
  const toca = s.rayo.ray.intersectPlane(s.plano, s.punto)
  const presente = toca !== null && t - s.punteroEn < 2.5
  s.presencia += ((presente ? 1 : 0) - s.presencia) * (1 - Math.exp(-dt / (presente ? 0.12 : 0.7)))
  const vale = toca !== null ? Math.min(1, piso.uPoder.value) * s.presencia : 0
  pasoDelRastro(piso.uRastro.value, s.rastro, s.punto.x, s.punto.z, vale, dt)
}
