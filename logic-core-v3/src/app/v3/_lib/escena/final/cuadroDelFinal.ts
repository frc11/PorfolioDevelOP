import * as THREE from 'three'

import { VIVO } from '../entorno/vivo'
import { FLOOR_Y } from '../probeScene'
import type { GestoDeScroll } from '../../gestosDelScroll'
import { CAMARA_SIN_EL_MOUSE } from '../sinElMouse'
import { viajeEnCurso } from '../viaje'
import { BRILLO_DEL_BANCO, BRILLO_EN_EL_PISO, FINAL_EN_EL_PISO, intensidadDelBrillo } from './enElPiso'
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
  distanciaDelFinalAngosto,
  pasoDelReloj,
  oscuroDelFinal,
  poder,
  poseDelLogo,
  quedaDelRebobinado,
  quietoRebobinado,
  relojDelQuieto,
  relojQuieto,
  sacudonDeLaPresion,
  subida,
  temblorDelLogo,
  type FaseDelFinal,
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
  /**
   * [PULIDO 1] P2 · el giro y el alejamiento del quieto al empezar el rebobinado (vuelven con él). P5 · o la vuelta de un
   * viaje: `de` es la fase con la que se tomaron (si cambia, se toman de nuevo desde donde quedaron).
   */
  readonly quietoAlRebobinar: { de: FaseDelFinal | null; giro: number; aleja: number }
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
  /** [PULIDO 1] P22 · con movimiento reducido (abajo de 1024): sin cinemática, el estado final quieto al llegar al fondo. */
  readonly estatico: boolean
  /** [PULIDO 1] P22 · abajo de 1024: el encuadre del final es el del teléfono (`distanciaDelFinalAngosto`). */
  readonly angosto: boolean
}

/** `formas`: las del logo en su plano (`hueco.ts`). */
export function crearElEstado(formas: readonly THREE.Shape[], espesor: number, estatico = false, angosto = false): EstadoDelFinal {
  return {
    reloj: relojQuieto(),
    fondo: Number.POSITIVE_INFINITY,
    gestos: { arriba: Number.NEGATIVE_INFINITY, abajo: Number.NEGATIVE_INFINITY, leido: 0, desde: Number.NEGATIVE_INFINITY, retenido: false, pico: 0, rebobinar: false },
    scroll: Number.NaN,
    sinScrollS: 0,
    enteroS: 0,
    quietoS: 0,
    quietoAlRebobinar: { de: null, giro: 0, aleja: 0 },
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
    estatico,
    angosto,
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
  p.uOscuroDelBrillo.value = 0
  s.pozo.grupo.visible = false
  s.aplicado = false
}

export interface CuadroDeLaEscena {
  readonly camera: THREE.Camera
  readonly scene: THREE.Scene
  readonly pointer: THREE.Vector2
}

const AL_FONDO_PX = 2
/** [PULIDO 1] P1 · las zonas del brillo nacen adentro de esta fracción de lo que se ve (no cortadas por el borde). */
const ALCANCE_DEL_BRILLO = 0.85
const DERECHA = new THREE.Vector3()
/** [PULIDO 1] P1 · cuánto se oscurece el piso con el brillo (la intensidad de esta carga, leída una vez). */
const OSCURECE = BRILLO_EN_EL_PISO.oscurece[intensidadDelBrillo()]
/** [PULIDO 1] P22 · el ancho del logo (u) si la escena todavía no lo publicó: el del SVG a su escala. */
const ANCHO_DEL_LOGO = 6.9
const ANTES_DEL_FINAL = new THREE.Quaternion()
const ahoraS = (): number => performance.now() / 1000

/**
 * [RETOQUE DEL ENCASTRE] 1D · un gesto de scroll (`gestosDelScroll.ts`): lo anota y dice si se retiene. [NOCTURNO FINAL] A1
 * · UN gesto hacia arriba al fondo, mientras corre o ya terminó, pide el rebobinado entero y se retiene ese gesto entero
 * (`decidirElGesto`). Un gesto hacia abajo justo después de uno hacia arriba no cuenta (el temblor de un dedo al
 * levantarse). Con el fondo del último cuadro: no se mide el documento en medio de la rueda.
 */
export function gestoDelFinal(s: EstadoDelFinal, g: GestoDeScroll): boolean {
  if (s.estatico) return false
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
  // [PULIDO 1] P22 · quieto (movimiento reducido): sin reloj, el estado final al fondo y el de siempre fuera.
  if (s.estatico) estadoQuieto(s.reloj, window.scrollY >= s.fondo - AL_FONDO_PX && EN_VIVO.pieEntero && viajeEnCurso() === null)
  else pasoDelReloj(s.reloj, { alFondo: window.scrollY >= s.fondo - AL_FONDO_PX, pieEntero: EN_VIVO.pieEntero, rebobinar, haciaAbajo, sinGestoS, viajeS: (viajeEnCurso()?.duracionMs ?? 0) / 1000 }, dt)
  EN_VIVO.fin = s.reloj.fin
  const fin = EN_VIVO.fin
  s.sinScrollS = window.scrollY === s.scroll ? s.sinScrollS + dt : 0
  s.scroll = window.scrollY
  // [EL ENCASTRE] 2G · el quieto espera también al final entero (arranca solo: sin esto ya llevaba 1,4 s sin scroll al terminar).
  // [RETOQUE DEL ENCASTRE] 1D · y a un rato sin gestos (al fondo la página no se mueve: un gesto no cambia el scroll).
  s.enteroS = fin > 0.995 ? s.enteroS + dt : 0
  // [PULIDO 1] P2 · rebobinando, el quieto vuelve con el mismo reloj y la misma curva que el logo (en a lo sumo 1,6 s); si
  // no, con su vuelta con tope de siempre (cortado a la mitad por un gesto hacia abajo, sigue desde donde quedó).
  // [PULIDO 1] P5 · en un viaje, igual (con el reloj de su vuelta; sin vuelta —el logo ya estaba en cero—, con la de siempre);
  // si empieza a mitad de un rebobinado, desde donde quedó.
  const alRebobinar = s.quietoAlRebobinar
  if (s.reloj.fase === 'rebobina' || (s.reloj.fase === 'viaje' && s.reloj.rebobinado.dura > 0)) {
    if (alRebobinar.de !== s.reloj.fase) {
      alRebobinar.de = s.reloj.fase
      alRebobinar.giro = ((((EN_VIVO.giro + 180) % 360) + 360) % 360) - 180
      alRebobinar.aleja = EN_VIVO.aleja
    }
    quietoRebobinado(alRebobinar, quedaDelRebobinado(s.reloj.rebobinado.s, s.reloj.rebobinado.dura), EN_VIVO)
    s.quietoS = 0
  } else {
    if (alRebobinar.de !== null) {
      alRebobinar.de = null
      if (s.reloj.fase === 'parada') quietoRebobinado(alRebobinar, 0, EN_VIVO)
    }
    // [PULIDO 1] P22 · quieto, sin el giro ni el alejamiento del que se quedó (son movimiento).
    if (s.estatico) quietoRebobinado(alRebobinar, 0, EN_VIVO)
    s.quietoS = s.estatico ? 0 : relojDelQuieto(s.quietoS, fin > 0.995, Math.min(s.sinScrollS, s.enteroS, sinGestoS), dt, EN_VIVO)
  }
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
  // [PULIDO 1] P22 · quieto, sin el golpecito ni la súper onda (son movimiento).
  if (!s.estatico && s.antes < aterriza && fin >= aterriza) s.tocoEn = t
  if (!s.estatico && s.antes < golpe && fin >= golpe) {
    s.golpeEn = t
    s.golpes += 1
    piso.uGolpe.value.set(t, 0, 0, 1)
  }
  s.antes = fin
  piso.uPoder.value = poder(fin)
  if (BRILLO_DEL_BANCO.apagado) piso.uPoder.value = 0
  // [PULIDO 1] P1 · el piso se oscurece parejo mientras corre el brillo (y vuelve al rebobinar: es función de `fin`).
  piso.uOscuroDelBrillo.value = OSCURECE * oscuroDelFinal(fin)
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
  // [PULIDO 1] P22 · abajo de 1024, a la distancia del encuadre del teléfono (el logo ocupa la mitad de lo que lo limita).
  const distancia = s.angosto && state.camera instanceof THREE.PerspectiveCamera ? distanciaDelFinalAngosto(state.camera.fov, state.camera.aspect, tamano.ancho ?? ANCHO_DEL_LOGO, tamano.alto) : null
  camaraDelFinal(state.camera, sube, EN_VIVO.blanco, EN_VIVO.giro, EN_VIVO.aleja, s.sacudon.lengthSq() > 0 ? s.sacudon : null, distancia)
  // [PULIDO 1] P1 · lo que se ve del piso alrededor del logo (donde nacen las zonas del brillo), con la cámara de este cuadro.
  if (state.camera instanceof THREE.PerspectiveCamera) {
    const medio = state.camera.position.distanceTo(EN_VIVO.blanco) * Math.tan(THREE.MathUtils.degToRad(state.camera.fov) / 2) * ALCANCE_DEL_BRILLO
    DERECHA.set(1, 0, 0).applyQuaternion(state.camera.quaternion)
    piso.uAlcanceDelBrillo.value.set(medio * state.camera.aspect, medio, Math.atan2(DERECHA.z, DERECHA.x))
  }
  // [RETOQUE DEL ENCASTRE] 1G · y el giro que le dio el final (de ahora a antes): el pie ve la luz como antes.
  ANTES_DEL_FINAL.copy(CAMARA_SIN_EL_MOUSE.quaternion)
  camaraDelFinal(CAMARA_SIN_EL_MOUSE, sube, EN_VIVO.blanco, EN_VIVO.giro, EN_VIVO.aleja, null, distancia)
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

/** [PULIDO 1] P22 · el reloj quieto (movimiento reducido): el final entero al fondo, en cero fuera; sin pasos intermedios. */
export function estadoQuieto(r: RelojDelFinal, alFondo: boolean): void {
  r.fin = alFondo ? 1 : 0
  r.velocidad = 0
  r.fase = alFondo ? 'parada' : 'espera'
}

/** [PULIDO 1] P22 · la otra lectura (`encastre=desvanece`): el pie se va mientras el final corre (en su primer 15 %). */
let pieDesvanecido: HTMLElement | null = null
let opacidadDelPie = -1
export function desvanecerElPie(fin: number): void {
  pieDesvanecido ??= document.getElementById('cierre')
  if (pieDesvanecido === null) return
  const opacidad = Math.round(Math.max(0, 1 - fin / 0.15) * 100) / 100
  if (opacidad === opacidadDelPie) return
  opacidadDelPie = opacidad
  pieDesvanecido.style.opacity = opacidad >= 1 ? '' : String(opacidad)
  pieDesvanecido.style.pointerEvents = opacidad <= 0 ? 'none' : ''
}
