import * as THREE from 'three'

import { VIVO } from '../entorno/vivo'
import { FLOOR_Y } from '../probeScene'
import type { GestoDeScroll } from '../../gestosDelScroll'
import { CAMARA_SIN_EL_MOUSE } from '../sinElMouse'
import { relojDelCuadro, segundosDelViaje, viajeEnCurso } from '../viaje'
import { CALMA_EN_EL_PISO, FINAL_EN_EL_PISO, LUZ_DEL_BANCO } from './enElPiso'
import { entornoDeLaEscena } from '../entorno'
import { CAMPO_QUIETO_EN, LUZ_DE_ABAJO, LUZ_DE_ABAJO_EN_VIVO, desdeLaUltimaOnda, radioDeLaExpansion } from './luzDeAbajo'
import { ANILLO_DE_LUZ, ANILLO_DEL_PRODUCTO, LUZ_DEL_ANILLO, partesDelAnillo, pulsoDelAnillo } from './anilloDeLuz'
import { LOGO_DEL_FINAL, LOGO_DEL_FINAL_EN_VIVO } from './logoDelFinal'
import { AIRE } from '../polvo/parche'
import { sonar } from '../../sonido/bus'
import { ORBITA_EN_VIVO, nuevaOrbita, pasoDeLaOrbita, ponerLaOrbita, type EstadoDeLaOrbita } from './orbitaDelMouse'
import { crearElPozo } from './hueco'
import { SOMBRA_EN_EL_FINAL } from '../sombra/delLogo'
import { apagarElRastro, pasoDelRastro, rastroQuieto, type EstadoDelRastro } from './rastro'
import { ENCUADRE_EN_VIVO } from './encuadreDelPie'
import { escribiendoEnUnCampo, pasoDelTeclado, sinTeclado, tecladoQuieto, type EstadoDelTeclado } from './teclado'
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
  distanciaParaElAncho,
  pasoDelReloj,
  expansionDeLaLuz,
  poder,
  poseDelLogo,
  quedaDelRebobinado,
  quietoRebobinado,
  relojDelQuieto,
  relojQuieto,
  sacudonDeLaPresion,
  sombraConFundido,
  sombraDeLaPose,
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
  readonly gestos: { arriba: number; abajo: number; ultimo: number; leido: number; desde: number; retenido: boolean; pico: number; rebobinar: boolean }
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
  /** [PULIDO 3B] B2 · la órbita del mouse en el pie (en escritorio, con puntero fino: `conMouse`). */
  readonly orbita: EstadoDeLaOrbita
  readonly conMouse: boolean
  /** [PULIDO 2] 1 · abajo de 1024, el final con el formulario del pie encima: escribiendo, quieto (`teclado.ts`). */
  readonly teclado: EstadoDelTeclado
  /** [PULIDO 2] 1 · el fondo que valió el último cuadro (abajo de 1024 lo decide el teclado; lo lee el gesto). */
  alFondo: boolean
  /** [PULIDO 2] 2 · el poder del piso que se muestra (baja con inercia: `poderSuave`). */
  poder: number
  /** [PULIDO 2] 6 · cuánto de la sombra del logo se ve (`sombraConFundido`). */
  sombra: number
}

/** `formas`: las del logo en su plano (`hueco.ts`). */
export function crearElEstado(formas: readonly THREE.Shape[], espesor: number, estatico = false, angosto = false): EstadoDelFinal {
  return {
    reloj: relojQuieto(),
    fondo: Number.POSITIVE_INFINITY,
    gestos: { arriba: Number.NEGATIVE_INFINITY, abajo: Number.NEGATIVE_INFINITY, ultimo: Number.NEGATIVE_INFINITY, leido: 0, desde: Number.NEGATIVE_INFINITY, retenido: false, pico: 0, rebobinar: false },
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
    orbita: nuevaOrbita(),
    conMouse: !angosto && !estatico && typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches,
    teclado: tecladoQuieto(),
    alFondo: false,
    poder: 0,
    sombra: 1,
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
  s.poder = 0
  p.uOscuroDelBrillo.value = 0
  LUZ_DE_ABAJO_EN_VIVO.uEnergiaDeLaLuz.value = 0
  LUZ_DE_ABAJO_EN_VIVO.uExpansionDeLaLuz.value.set(0, 0)
  LUZ_DEL_ANILLO.uLuzDelAnillo.value = 0
  LUZ_DEL_ANILLO.uEnsambleDelAnillo.value = 0
  LUZ_DEL_ANILLO.uLuzDelDisco.value = 0
  LOGO_DEL_FINAL_EN_VIVO.uLogoDelFinal.value = 0
  LOGO_DEL_FINAL_EN_VIVO.uFiloDelFinal.value = 0
  AIRE.uSinPolvoSobreElLogo.value.w = 0
  s.pozo.grupo.visible = false
  s.aplicado = false
  Object.assign(s.orbita, nuevaOrbita())
}

export interface CuadroDeLaEscena {
  readonly camera: THREE.Camera
  readonly scene: THREE.Scene
  readonly pointer: THREE.Vector2
}

const AL_FONDO_PX = 2
/** [PULIDO 2] 1 · sólo para el banco: el reloj clavado en un `fin` (para medir el contraste del pie en un cuadro quieto). */
export const FINAL_DEL_BANCO: { fijo: number | null } = { fijo: null }
/** [PULIDO 2] 4 · dónde la luz se apaga contra el mar calmo (u, desde y hasta: el anillo de su borde, más el margen). */
const CALMA_DE_LA_LUZ = [CALMA_EN_EL_PISO.radio + 0.5 * CALMA_EN_EL_PISO.borde, CALMA_EN_EL_PISO.radio + CALMA_EN_EL_PISO.borde + LUZ_DE_ABAJO.margen] as const
/** [PULIDO 1] P22 · el ancho del logo (u) si la escena todavía no lo publicó: el del SVG a su escala. */
const ANCHO_DEL_LOGO = 6.9
const ANTES_DEL_FINAL = new THREE.Quaternion()
const ahoraS = (): number => performance.now() / 1000
/** [PULIDO 5] D2 · la variante de la luz del encastre de esta carga (`?anillo=`; sin bandera, `tubo`), leída una vez. */
let partesDeLaLuz: ReturnType<typeof partesDelAnillo> | null = null
const suave = (u: number): number => {
  const x = Math.min(1, Math.max(0, u))
  return x * x * (3 - 2 * x)
}

/** [PULIDO 2] 2 · cuánto tarda el poder del piso en irse (s) cuando el final vuelve (sube de una: llega con el golpe). */
export const BAJA_DEL_PODER_S = 0.3

/** [PULIDO 2] 2 · el poder que se muestra: sube con el de `fin`; baja hacia él con inercia (sin el corte del golpe). */
export function poderSuave(anterior: number, objetivo: number, dt: number): number {
  if (!(objetivo < anterior)) return objetivo
  return objetivo + (anterior - objetivo) * Math.exp(-Math.max(0, dt) / BAJA_DEL_PODER_S)
}

/** [PULIDO 2] 2 · cuánto lleva el viaje del menú en el reloj del viaje (el del scroll), avanzado con la marca de este cuadro. */
function enElViaje(): number {
  const marca = document.timeline.currentTime
  relojDelCuadro(typeof marca === 'number' ? marca : performance.now())
  return segundosDelViaje()
}

/**
 * [RETOQUE DEL ENCASTRE] 1D · un gesto de scroll (`gestosDelScroll.ts`): lo anota y dice si se retiene. [NOCTURNO FINAL] A1
 * · UN gesto hacia arriba al fondo, mientras corre o ya terminó, pide el rebobinado entero y se retiene ese gesto entero
 * (`decidirElGesto`). Un gesto hacia abajo justo después de uno hacia arriba no cuenta (el temblor de un dedo al
 * levantarse). Con el fondo del último cuadro: no se mide el documento en medio de la rueda.
 */
export function gestoDelFinal(s: EstadoDelFinal, g: GestoDeScroll): boolean {
  if (s.estatico) return false
  const ahora = ahoraS()
  // [PULIDO 2] 1 · escribiendo en el formulario del pie (abajo de 1024), un gesto no rebobina ni se retiene: mueve la página
  // (y queda anotado: al salir del campo, el visitante ya movió la página él).
  s.gestos.ultimo = ahora
  if (s.angosto && s.teclado.escribiendo) return false
  const alFondo = s.angosto ? s.alFondo : window.scrollY >= s.fondo - AL_FONDO_PX
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
  // [PULIDO 2] 1 · abajo de 1024, con el foco en un campo del pie el reloj queda donde está y el teclado (el viewport que se
  // achica, el scroll que acomoda el campo) no cambia el fondo que vale; en escritorio, el fondo medido de siempre.
  const alFondoMedido = window.scrollY >= s.fondo - AL_FONDO_PX
  const teclado = s.angosto ? pasoDelTeclado(s.teclado, escribiendoEnUnCampo(), alFondoMedido, window.visualViewport?.height ?? window.innerHeight, window.scrollY, ahora, s.gestos.ultimo) : sinTeclado(alFondoMedido)
  s.alFondo = teclado.alFondo
  // [PULIDO 1] P22 · quieto (movimiento reducido): sin reloj, el estado final al fondo y el de siempre fuera.
  if (FINAL_DEL_BANCO.fijo !== null) {
    s.reloj.fin = FINAL_DEL_BANCO.fijo
    s.reloj.velocidad = 0
  } else if (s.estatico) estadoQuieto(s.reloj, teclado.alFondo && EN_VIVO.pieEntero && viajeEnCurso() === null)
  else if (!teclado.congelado) pasoDelReloj(s.reloj, { alFondo: teclado.alFondo, pieEntero: EN_VIVO.pieEntero, rebobinar, haciaAbajo, sinGestoS, viajeS: (viajeEnCurso()?.duracionMs ?? 0) / 1000, enElViajeS: enElViaje() }, dt)
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
    // [PULIDO 2] 1 · escribiendo, el quieto tampoco se mueve (el teclado mueve el scroll: no es el visitante).
    if (!teclado.congelado) s.quietoS = s.estatico ? 0 : relojDelQuieto(s.quietoS, fin > 0.995, Math.min(s.sinScrollS, s.enteroS, sinGestoS), dt, EN_VIVO)
  }
  // [PULIDO 2] 6 · la sombra del logo se va al apoyarse y vuelve con un fundido (también después de soltar el final).
  s.sombra = s.estatico ? sombraDeLaPose(fin, tamano) : sombraConFundido(s.sombra, sombraDeLaPose(fin, tamano), dt)
  SOMBRA_EN_EL_FINAL.fundido = s.sombra
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
  LUZ_DE_ABAJO_EN_VIVO.uCalmaDeLaLuz.value.set(CALMA_DE_LA_LUZ[0], CALMA_DE_LA_LUZ[1], piso.uCalmaDelFinal.value)
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
    // [PULIDO 4] C2 · el golpe suena en este mismo instante (el logo conecta y nace la súper onda). Sólo cuando `fin` cruza el
    // golpe hacia adelante: también en el reinicio automático, nunca en el rebobinado. Apagado o sin el gesto, `sonar` no hace nada.
    // [PULIDO 5] D2 · uno solo: el de la sala (era `golpe-b`; `golpe-a` se borró).
    sonar('golpe')
  }
  s.antes = fin
  piso.uPoder.value = poder(fin)
  // [PULIDO 2] 2 · baja con inercia: en el rebobinado (y en la vuelta de un viaje, que es el mismo, comprimido) `poder` cae
  // entero en el golpe y el brillo se apagaba de un cuadro al otro.
  s.poder = poderSuave(s.poder, piso.uPoder.value, dt)
  piso.uPoder.value = s.poder
  // [PULIDO 2] 4 · la energía de la luz de abajo es el poder del piso (con su inercia: en el rebobinado se va en varios cuadros).
  LUZ_DE_ABAJO_EN_VIVO.uEnergiaDeLaLuz.value = LUZ_DEL_BANCO.apagada ? 0 : Math.min(1, s.poder)
  // [PULIDO 3] A1 · y sale del hueco en el golpe, hasta cubrir la escena (función de `fin`: al rebobinar se retira igual).
  const expansion = expansionDeLaLuz(fin)
  // [PULIDO 4] C2 · `?energia=intensa` se borró: la energía es la del producto (B0).
  LUZ_DE_ABAJO_EN_VIVO.uRelojDeLaLuz.value = s.estatico ? CAMPO_QUIETO_EN : t
  LUZ_DE_ABAJO_EN_VIVO.uExpansionDeLaLuz.value.set(expansion > 0 ? radioDeLaExpansion(expansion, CALMA_DE_LA_LUZ[0]) : 0, expansion)
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
  // [PULIDO 2] 1 · y, detrás del pie, en el hueco más grande entre sus elementos (`encuadreDelPie.ts`): ahí y de ese ancho.
  const encuadre = s.angosto ? ENCUADRE_EN_VIVO.valor : null
  const vista = ENCUADRE_EN_VIVO.vista
  const distancia = !s.angosto || !(state.camera instanceof THREE.PerspectiveCamera) ? null : encuadre === null ? distanciaDelFinalAngosto(state.camera.fov, state.camera.aspect, tamano.ancho ?? ANCHO_DEL_LOGO, tamano.alto) : distanciaParaElAncho(state.camera.fov, state.camera.aspect, tamano.ancho ?? ANCHO_DEL_LOGO, encuadre.ancho / vista.ancho)
  const corrimiento = encuadre === null ? null : { x: (2 * encuadre.cx) / vista.ancho - 1, y: 1 - (2 * encuadre.cy) / vista.alto }
  camaraDelFinal(state.camera, sube, EN_VIVO.blanco, EN_VIVO.giro, EN_VIVO.aleja, s.sacudon.lengthSq() > 0 ? s.sacudon : null, distancia, corrimiento)
  // [PULIDO 3B] B2 · en escritorio el mouse orbita la cámara alrededor del logo (atenuada mientras corre la cinemática, rebobina
  // o viaja; entera en el quieto; al centro con el mouse fuera de la ventana: `orbitaDelMouse.ts`), con la subida: al soltar el final no salta.
  pasoDeLaOrbita(s.orbita, s.conMouse && !ORBITA_EN_VIVO.fuera ? ORBITA_EN_VIVO : null, fin >= 0.999 && s.reloj.fase === 'corre', dt)
  ponerLaOrbita(state.camera, EN_VIVO.blanco, s.orbita.h * sube, s.orbita.v * sube)
  // [PULIDO 3] A1 · la sala se oscurece gradual con la expansión de la energía. [PULIDO 3B] B0 · lo que se veía del piso (donde
  // nacían las chispas) se fue con ellas.
  const extendida = (1 - (1 - expansion) * (1 - expansion)) * LUZ_DE_ABAJO_EN_VIVO.uEnergiaDeLaLuz.value
  piso.uOscuroDelBrillo.value = LUZ_DE_ABAJO.oscurece * extendida
  // [PULIDO 5] D2 · la luz del encastre (`anilloDeLuz.ts`; era el círculo difuso de PULIDO 4): aparece mientras el logo presiona
  // (de que toca el piso al golpe), en el golpe el anillo se ensambla (sus huecos se cierran) y desde ahí queda sólido; pulsa con
  // cada onda y con el golpe. Función de `fin` (al rebobinar se desarma igual); quieto, ensamblado y sin pulsos.
  const pedido = entornoDeLaEscena().pruebas.anillo
  const partes = (partesDeLaLuz ??= partesDelAnillo(pedido === 'no' ? ANILLO_DEL_PRODUCTO : pedido))
  const conLuz = s.estatico ? (fin >= golpe ? 1 : 0) : suave((fin - aterriza) / Math.max(1e-6, golpe - aterriza))
  const pulso = s.estatico ? 0 : Math.max(ANILLO_DE_LUZ.onda * pulsoDelAnillo(desdeLaUltimaOnda(LUZ_DE_ABAJO_EN_VIVO.uRelojDeLaLuz.value), ANILLO_DE_LUZ.ondaS) * extendida, ANILLO_DE_LUZ.golpe * pulsoDelAnillo(desdeElGolpe, ANILLO_DE_LUZ.golpeS))
  LUZ_DEL_ANILLO.uLuzDelAnillo.value = partes.tubo ? conLuz * (ANILLO_DE_LUZ.base + pulso) : 0
  LUZ_DEL_ANILLO.uEnsambleDelAnillo.value = s.estatico ? 1 : suave((fin - golpe) / (ANILLO_DE_LUZ.ensambleS / RELOJ_DEL_FINAL.duracionS))
  LUZ_DEL_ANILLO.uLuzDelDisco.value = partes.disco ? conLuz * (ANILLO_DE_LUZ.disco + pulso) : 0
  // [PULIDO 5] D2 · el logo, lo que más se ve (`logoDelFinal.ts`): con la cámara que sube, sin niebla, con menos reflejo y sin
  // polvo encima; con filo, su borde blanco (con la luz del encastre).
  LOGO_DEL_FINAL_EN_VIVO.uLogoDelFinal.value = sube
  LOGO_DEL_FINAL_EN_VIVO.uFiloDelFinal.value = partes.filo ? conLuz : 0
  AIRE.uSinPolvoSobreElLogo.value.set(logo?.position.x ?? 0, logo?.position.z ?? 0, LOGO_DEL_FINAL.sinPolvo, sube)
  // [RETOQUE DEL ENCASTRE] 1G · y el giro que le dio el final (de ahora a antes): el pie ve la luz como antes.
  ANTES_DEL_FINAL.copy(CAMARA_SIN_EL_MOUSE.quaternion)
  camaraDelFinal(CAMARA_SIN_EL_MOUSE, sube, EN_VIVO.blanco, EN_VIVO.giro, EN_VIVO.aleja, null, distancia, corrimiento)
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
