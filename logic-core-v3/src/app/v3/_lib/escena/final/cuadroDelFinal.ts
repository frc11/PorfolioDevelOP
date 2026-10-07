import * as THREE from 'three'

import { VIVO } from '../entorno/vivo'
import { FLOOR_Y } from '../probeScene'
import type { GestoDeScroll } from '../../gestosDelScroll'
import { CAMARA_SIN_EL_MOUSE } from '../sinElMouse'
import { viajeEnCurso } from '../viaje'
import { FINAL_EN_EL_PISO } from './enElPiso'
import { FINAL_EN_REPOSO } from './enReposo'
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
  decidirElGesto,
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

/** Lo del final que vive entre cuadros: lo arma `FinalDelPie` una vez y lo usa `alCuadroDelFinal`. */
export interface EstadoDelFinal {
  /** [EL ENCASTRE] 2A · el reloj de `fin`. */
  readonly reloj: RelojDelFinal
  /**
   * [RETOQUE DEL ENCASTRE] 1D · el fondo de la página (px de scroll, el del último cuadro) y los últimos gestos (s, en
   * `performance.now`). [NOCTURNO FINAL] A1 · y el gesto en curso: cuándo empezó, si se retuvo, su evento más fuerte (px)
   * y si pidió rebobinar.
   */
  fondo: number
  readonly gestos: { arriba: number; abajo: number; leido: number; desde: number; retenido: boolean; pico: number; rebobinar: boolean }
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
    reloj: relojQuieto(),
    fondo: Number.POSITIVE_INFINITY,
    gestos: { arriba: Number.NEGATIVE_INFINITY, abajo: Number.NEGATIVE_INFINITY, leido: 0, desde: Number.NEGATIVE_INFINITY, retenido: false, pico: 0, rebobinar: false },
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
  EN_VIVO.giroDelPie.identity()
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

const AL_FONDO_PX = 2
const ANTES_DEL_FINAL = new THREE.Quaternion()
const ahoraS = (): number => performance.now() / 1000

/**
 * [RETOQUE DEL ENCASTRE] 1D · un gesto de scroll (`gestosDelScroll.ts`): lo anota y dice si se retiene. [NOCTURNO FINAL] A1
 * · UN gesto hacia arriba al fondo, mientras corre o ya terminó, pide el rebobinado entero y se retiene ese gesto entero
 * (`decidirElGesto`). Un gesto hacia abajo justo después de uno hacia arriba no cuenta (el temblor de un dedo al
 * levantarse). Con el fondo del último cuadro: no se mide el documento en medio de la rueda.
 */
export function gestoDelFinal(s: EstadoDelFinal, g: GestoDeScroll): boolean {
  const ahora = ahoraS()
  const alFondo = window.scrollY >= s.fondo - AL_FONDO_PX
  const G = s.gestos
  if (g.nuevo) {
    G.desde = ahora
    G.pico = 0
  }
  const enLaCola = g.magnitud > 0 && g.magnitud <= RELOJ_DEL_FINAL.colaDelGesto * G.pico
  G.pico = Math.max(G.pico, g.magnitud)
  const d = decidirElGesto(s.reloj, alFondo, g.sentido, g.nuevo, G.retenido, ahora - G.desde, enLaCola)
  G.retenido = d.retiene
  if (d.rebobina) G.rebobinar = true
  if (g.sentido < 0) G.arriba = ahora
  else if (ahora - G.arriba > RELOJ_DEL_FINAL.cambioDeSentidoS) G.abajo = ahora
  return d.retiene
}

/** Un cuadro del final: el reloj, el quieto, el logo, el hueco, el golpe, la cámara y el piso. */
export function alCuadroDelFinal(s: EstadoDelFinal, state: CuadroDeLaEscena, delta: number, logo: THREE.Group | null, tamano: TamanoDelLogo): void {
  const dt = Math.min(Math.max(delta, 0), 0.1)
  const t = VIVO.uTiempo.value
  // 1 · [RETOQUE DEL ENCASTRE] 1D · el reloj: al fondo, arranca solo cuando el pie llegó entero y corre a su ritmo (el
  // scroll hacia abajo no lo adelanta). [NOCTURNO FINAL] A1 · un gesto hacia arriba lo rebobina entero, solo; parado,
  // vuelve a empezar a los 2,5 s sin gestos. A2 · fuera del fondo o en un viaje, se deshace con tope.
  s.fondo = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
  EN_VIVO.pegadoDesde = s.fondo
  const ahora = ahoraS()
  const haciaAbajo = s.gestos.abajo > s.gestos.leido
  s.gestos.leido = ahora
  const rebobinar = s.gestos.rebobinar
  s.gestos.rebobinar = false
  const sinGestoS = ahora - Math.max(s.gestos.arriba, s.gestos.abajo)
  pasoDelReloj(s.reloj, { alFondo: window.scrollY >= s.fondo - AL_FONDO_PX, pieEntero: EN_VIVO.pieEntero, rebobinar, haciaAbajo, sinGestoS, enViaje: viajeEnCurso() !== null }, dt)
  EN_VIVO.fin = s.reloj.fin
  const fin = EN_VIVO.fin
  s.sinScrollS = window.scrollY === s.scroll ? s.sinScrollS + dt : 0
  s.scroll = window.scrollY
  // [EL ENCASTRE] 2G · el quieto espera también al final entero (arranca solo: sin esto ya llevaba 1,4 s sin scroll al terminar).
  // [RETOQUE DEL ENCASTRE] 1D · y a un rato sin gestos (al fondo la página no se mueve: un gesto no cambia el scroll).
  s.enteroS = fin > 0.995 ? s.enteroS + dt : 0
  s.quietoS = relojDelQuieto(s.quietoS, fin > 0.995, Math.min(s.sinScrollS, s.enteroS, sinGestoS), dt, EN_VIVO)
  const activo = fin > 0 || EN_VIVO.giro !== 0 || EN_VIVO.aleja !== 0
  // [NOCTURNO FINAL] A2 · el viaje del menú espera a esto para mover el scroll.
  FINAL_EN_REPOSO.valor = !activo
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
  // [RETOQUE DEL ENCASTRE] 1G · y el giro que le dio el final (de ahora a antes): el pie ve la luz como antes.
  ANTES_DEL_FINAL.copy(CAMARA_SIN_EL_MOUSE.quaternion)
  camaraDelFinal(CAMARA_SIN_EL_MOUSE, sube, EN_VIVO.blanco, EN_VIVO.giro, EN_VIVO.aleja, null)
  EN_VIVO.giroDelPie.copy(CAMARA_SIN_EL_MOUSE.quaternion).invert().premultiply(ANTES_DEL_FINAL)

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
