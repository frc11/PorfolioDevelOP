/**
 * NOCTURNO FINAL — el invariante: npm run test:s52-nocturno-final
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por ticket:
 *   A1 · el rebobinado de UN gesto: un gesto hacia arriba al fondo rebobina la cinemática ENTERA, sola y a su velocidad
 *        (no acelerada), sin mover la página; parada, vuelve a empezar a los 2,5 s sin gestos; un gesto nuevo hacia arriba
 *        sube la página; rueda (con su inercia), dedo y teclas.
 *   A2 · los viajes del menú con la cinemática avanzada: primero se deshace con tope (la cámara baja del cenit sin saltos)
 *        y después se viaja; la cámara del final conserva el encuadre del recorrido (no se teletransporta al soltar); el
 *        viaje largo tarda más (velocidad con tope) y un cuadro largo no lo hace saltar.
 *   A3 · Portfolio desde el menú: nada de las Demos al llegar (su aparición alcanza lo pedido en un viaje).
 *   A4 · la sombra cuadrada: en un viaje la altura del sol es la de su luz (la del logo no se estira por el piso); las
 *        piezas del pie no proyectan sombra y fuera de su sección no se dibujan.
 *   A5 · teléfono: al pasar a las Demos la escena de atrás no se congela (se suspende sólo con el bloque opaco tapando).
 *   A6 · «Hablemos» del hero abre el panel de contacto (no lleva al pie).
 *   A7 · «Quiero mi…» de Servicios abre el panel de contacto con su opción marcada.
 *   B1 · el intro del logo: cae desde arriba y llega cuando termina de armarse el titular; la súper onda (la del encastre).
 *   B2 · el piso volcán: el mouse sólo levanta; destellos de lava al azar por las juntas de todo el piso; el atardecer parejo.
 *   B3 · el círculo estable: alrededor del logo, liso y quieto, sin bordes; no reacciona al mouse ni a las ondas.
 *   B4 · el polvo en el pie: en la cinemática no se posa; el que cae no atraviesa las piezas del pie (un cupo se apoya).
 *   C1 · teléfono y tablet: el texto de Trabajos se lee sobre el logo de noche (un halo: la mezcla no atraviesa el pin).
 *   C2 · Tu panel en el teléfono y la tablet: una columna, cada bloque al ancho; las demos se leen (pantalla angosta).
 * Lo que se mira en vivo: `~/.cache/b4-medicion/nocturno-final/mirar.txt`.
 */
import { readFileSync } from 'node:fs'

import * as THREE from 'three'

import { CURVA_DEL_VIAJE, DURACION_DEL_VIAJE_MS, VIAJE_CON_TOPE, duracionDelViaje } from '../../_componentes/deslizamiento'
import { viajarSinLenis } from '../../_componentes/viajeSinLenis'
import { aimWithFraming } from '../escena/cameraFraming'
import { ANCLAS_DEL_HUECO, CALMA_EN_EL_PISO, GOLPE_EN_EL_PISO, LAVA_EN_EL_PISO, conElFinalEnElPiso, conElFinalEnLaSimulacion } from '../escena/final/enElPiso'
import { CAIDA_DEL_LOGO, alturaDeLaCaida } from '../escena/intro/caida'
import { SIMULACION_GLSL } from '../escena/piso/bloques'
import { ANCLAS_DEL_DIBUJO, conOndaDirigida } from '../escena/piso/ondaDirigida'
import { elevacionDe } from '../escena/lightArc'
import { ATARDECER_DEL_FINAL, FINAL_DEL_PIE, RELOJ_DEL_FINAL, atardecer, camaraDelFinal, decidirElGesto, haciaCero, pasoDelReloj, relojDelQuieto, relojQuieto, subida, type EntradaDelReloj, type RelojDelFinal } from '../escena/final/recorridoDelFinal'
import { bloqueTapaElCuadro } from '../escena/nocheDisparada'
import { CAJAS_DEL_PIE_GLSL, POLVO_EN_EL_PIE } from '../escena/pie3d/cajasDelPolvo'
import { ORBIT_TARGET_Y } from '../escena/probeScene'
import { TOPE_DEL_CUADRO_DEL_VIAJE_MS } from '../escena/viaje'
import { SEPARA_LOS_GESTOS_MS, empiezaUnGesto } from '../gestosDelScroll'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'
import { ABRE_EL_PANEL } from '../../_chrome/contacto/apertura'
import { ANCHO_CON_BARRA, DEMO_ANGOSTA, pantallaAngosta } from '../../_panel-vivo/DemoDelPanel'
import { claseEnColumna } from '../../_secciones/tu-panel/geometria'
import { INTERESES, PRECARGA_POR_SERVICIO } from '../../_chrome/contacto/contenido'
import { Hero } from '../../_secciones/hero/Hero'
import { Cierre } from '../../_secciones/cierre/Cierre'
import { WHATSAPP } from '../../_secciones/cierre/contacto'
import { marcar } from '../../_secciones/_invariantes/render'
import { seccionDe } from '../../_secciones/_contrato/forma'
import { CONTENIDO as CONTENIDO_DEL_HERO } from '../../_secciones/hero/contenido'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const R = RELOJ_DEL_FINAL
const DT = 1 / 60
type PasoDelReloj = (r: RelojDelFinal, e: EntradaDelReloj, dt: number) => void
const AL_FONDO: EntradaDelReloj = { alFondo: true, pieEntero: true, rebobinar: false, haciaAbajo: false, sinGestoS: 0, enViaje: false }
const entero = (paso: PasoDelReloj): RelojDelFinal => {
  const r = relojQuieto()
  for (let i = 0; i < 1200 && r.fin < 1; i += 1) paso(r, AL_FONDO, DT)
  return r
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('A1 · Rebobinado de UN gesto: entero, solo, a la velocidad de la cinemática; parado vuelve a empezar a los 2,5 s')

interface UnGesto { readonly rebobinaS: number; readonly velocidadMaxima: number; readonly fase: string; readonly paradaS: number }
/** Desde el final entero, UN gesto (un cuadro) y nada más: cuánto tarda en volver a cero, a qué velocidad, y cuánto se queda parado. */
const unGesto = (paso: PasoDelReloj): UnGesto => {
  const r = entero(paso)
  let t = 0
  paso(r, { ...AL_FONDO, rebobinar: true }, DT)
  t += DT
  let velocidadMaxima = 0
  let rebobinaS = Number.POSITIVE_INFINITY
  let antes = r.fin
  for (let i = 0; i < 1200; i += 1) {
    paso(r, { ...AL_FONDO, sinGestoS: t }, DT)
    t += DT
    velocidadMaxima = Math.max(velocidadMaxima, Math.abs(r.fin - antes) / DT)
    antes = r.fin
    if (r.fin === 0) {
      rebobinaS = t
      break
    }
  }
  const fase = r.fase
  let paradaS = 0
  for (let i = 0; i < 600 && r.fin === 0; i += 1) {
    paso(r, { ...AL_FONDO, sinGestoS: t }, DT)
    t += DT
    if (r.fin === 0) paradaS += DT
  }
  return { rebobinaS, velocidadMaxima, fase, paradaS }
}
const unGestoBien = (g: UnGesto): boolean => Math.abs(g.rebobinaS - R.duracionS) < 0.3 && g.velocidadMaxima <= (1 / R.duracionS) * 1.001 && g.fase === 'parada' && Math.abs(g.paradaS - R.vuelveAEmpezarS) < 0.05
const g1 = unGesto(pasoDelReloj)
afirmar(unGestoBien(g1), 'UN gesto hacia arriba (un solo cuadro con el pedido) rebobina la cinemática ENTERA, sola, a la velocidad de la cinemática (no acelerada) hasta el logo parado; parada, vuelve a empezar sola a los 2,5 s sin gestos', `rebobina en ${g1.rebobinaS.toFixed(2)} s · a lo sumo ${g1.velocidadMaxima.toFixed(4)}/s · parada ${g1.paradaS.toFixed(2)} s`)
const mientrasSiga: PasoDelReloj = (r, e, dt) => {
  if (r.fase === 'rebobina' && !e.rebobinar) r.fase = 'corre'
  pasoDelReloj(r, e, dt)
}
controlPositivo('el detector VE el de RETOQUE DEL ENCASTRE 1D (rebobina sólo mientras siga el gesto: al soltar, se vuelve a encastrar)', mientrasSiga, (p: PasoDelReloj) => unGestoBien(unGesto(p)))
const acelerado: PasoDelReloj = (r, e, dt) => {
  pasoDelReloj(r, e, dt)
  if (r.fase === 'rebobina') pasoDelReloj(r, e, dt)
}
controlPositivo('  y uno acelerado (rebobina al doble)', acelerado, (p: PasoDelReloj) => unGestoBien(unGesto(p)))
const sinVolver: PasoDelReloj = (r, e, dt) => {
  pasoDelReloj(r, e, dt)
  if (r.fase === 'corre' && r.fin < 0.01 && !e.haciaAbajo) {
    r.fase = 'parada'
    r.fin = 0
    r.velocidad = 0
  }
}
controlPositivo('  y uno que se queda parado para siempre', sinVolver, (p: PasoDelReloj) => unGestoBien(unGesto(p)))

// Parada con gestos recientes no arranca; hacia abajo arranca ya (parada o rebobinando).
const parada = (): RelojDelFinal => {
  const r = entero(pasoDelReloj)
  pasoDelReloj(r, { ...AL_FONDO, rebobinar: true }, DT)
  for (let i = 0; i < 1200 && r.fin > 0; i += 1) pasoDelReloj(r, { ...AL_FONDO, sinGestoS: 99 }, DT)
  return r
}
const p1 = parada()
for (let i = 0; i < 300; i += 1) pasoDelReloj(p1, { ...AL_FONDO, sinGestoS: 0.5 }, DT)
const conGestos = p1.fin === 0 && p1.fase === 'parada'
const p2 = parada()
pasoDelReloj(p2, { ...AL_FONDO, haciaAbajo: true }, DT)
for (let i = 0; i < 10; i += 1) pasoDelReloj(p2, AL_FONDO, DT)
const r3 = entero(pasoDelReloj)
pasoDelReloj(r3, { ...AL_FONDO, rebobinar: true }, DT)
for (let i = 0; i < 60; i += 1) pasoDelReloj(r3, AL_FONDO, DT)
const enMedio = r3.fin
pasoDelReloj(r3, { ...AL_FONDO, haciaAbajo: true }, DT)
for (let i = 0; i < 60; i += 1) pasoDelReloj(r3, AL_FONDO, DT)
afirmar(conGestos && p2.fase === 'corre' && p2.fin > 0 && r3.fase === 'corre' && r3.fin > enMedio, '  parada con gestos recientes no arranca (espera 2,5 s sin gestos); un gesto hacia abajo la corre ya, parada o a mitad del rebobinado')

// Qué se retiene y qué pide rebobinar.
const enFase = (fase: RelojDelFinal['fase'], fin: number): RelojDelFinal => ({ fin, velocidad: 0, fase, paradaS: 0 })
type Decide = typeof decidirElGesto
const decisionBien = (f: Decide): boolean => {
  const corre = enFase('corre', 1)
  const rebobinando = enFase('rebobina', 0.5)
  const nuevoCorriendo = f(corre, true, -1, true, false, 0, false)
  const tope = R.topeDelGestoS
  return nuevoCorriendo.retiene && nuevoCorriendo.rebobina && !f(enFase('corre', 0), true, -1, true, false, 0, false).retiene && !f(corre, true, 1, true, false, 0, false).retiene && !f(corre, false, -1, true, false, 0, false).retiene &&
    f(rebobinando, true, -1, false, true, tope - 0.1, false).retiene && !f(rebobinando, true, -1, false, true, tope - 0.1, false).rebobina && !f(rebobinando, true, -1, false, true, tope + 0.01, false).retiene && f(rebobinando, true, -1, false, true, tope + 2, true).retiene && !f(rebobinando, true, -1, false, false, 0.1, true).retiene &&
    !f(rebobinando, true, -1, true, false, 0, false).retiene && !f(enFase('parada', 0), true, -1, true, false, 0, false).retiene && !f(enFase('espera', 0), true, -1, true, false, 0, false).retiene
}
afirmar(decisionBien(decidirElGesto), '  se retiene el gesto que EMPIEZA hacia arriba al fondo mientras corre o ya terminó (pide el rebobinado) y lo que sigue de ese gesto: durante su tope, y después sólo su cola (la inercia que se apaga; el que sigue girando la rueda, sube); un gesto nuevo rebobinando, parada o esperando al pie sube la página; hacia abajo y fuera del fondo, nunca', `tope ${String(R.topeDelGestoS)} s · cola: a lo sumo ${String(R.colaDelGesto)} del evento más fuerte`)
controlPositivo('  el detector VE una retención de todo lo que sube al fondo mientras no está en cero (el visitante quedaría atrapado)', ((r: RelojDelFinal, alFondo: boolean, sentido: -1 | 1) => (alFondo && sentido < 0 && r.fin > 0 ? { retiene: true, rebobina: true } : { retiene: false, rebobina: false })) as Decide, decisionBien)
controlPositivo('  y una sin cola (la inercia de un trackpad, pasado el tope, subiría la página a mitad del rebobinado)', ((r: RelojDelFinal, alFondo: boolean, sentido: -1 | 1, nuevo: boolean, retenido: boolean, duraS: number) => decidirElGesto(r, alFondo, sentido, nuevo, retenido, duraS, false)) as Decide, decisionBien)

// UN gesto: la rueda hasta un silencio (el trackpad y su inercia son uno), un dedo, una tecla (su repetición no).
type Empieza = typeof empiezaUnGesto
const segmentaBien = (f: Empieza): boolean => {
  const rueda = { origen: 'rueda', sentido: -1, t: 1000 }
  const inercia = [16, 33, 60, 120, SEPARA_LOS_GESTOS_MS - 1].every((d) => !f(rueda, 'rueda', -1, 1000 + d, false))
  return f(null, 'rueda', -1, 0, false) && inercia && f(rueda, 'rueda', -1, 1000 + SEPARA_LOS_GESTOS_MS + 1, false) && f(rueda, 'rueda', 1, 1010, false) && f(rueda, 'tecla', -1, 1010, true) &&
    !f({ origen: 'tecla', sentido: -1, t: 1000 }, 'tecla', -1, 1500, false) && f({ origen: 'tecla', sentido: -1, t: 1000 }, 'tecla', -1, 1050, true) && f({ origen: 'dedo', sentido: -1, t: 1000 }, 'dedo', -1, 1010, true) && !f({ origen: 'dedo', sentido: -1, t: 1000 }, 'dedo', -1, 1400, false)
}
afirmar(segmentaBien(empiezaUnGesto), '  UN gesto: la rueda hasta un silencio de 200 ms (la inercia del trackpad sigue siendo el mismo gesto), cada dedo que se apoya, cada tecla apretada (su repetición no) y cualquier cambio de sentido u origen', `${String(SEPARA_LOS_GESTOS_MS)} ms`)
controlPositivo('  el detector VE una rueda en la que cada evento es un gesto nuevo (la inercia subiría la página)', (() => true) as Empieza, segmentaBien)

// El cableado: el módulo de gestos marca `nuevo`; el final decide con eso y no cuenta el temblor hacia abajo.
const gestos = sinComentarios(leer('_lib/gestosDelScroll.ts'))
const cuadro = sinComentarios(leer('_lib/escena/final/cuadroDelFinal.ts'))
const cableadoA1 = (g: string, c: string): boolean =>
  g.includes("const g: GestoDeScroll = { sentido, origen, nuevo: empiezaUnGesto(ultimo, origen, sentido, t, apoyo), magnitud }") && g.includes("decidir(sentido, 'tecla', e.timeStamp, !e.repeat, 0)") && g.includes("decidir(sentido, 'dedo', e.timeStamp, apoyo, magnitud)") && g.includes("decidir(sentido, 'rueda', e.timeStamp, false, Math.abs(e.deltaY))") &&
  /if \(g\.nuevo\) \{\s*G\.desde = ahora\s*G\.pico = 0\s*\}/.test(c) && c.includes('const enLaCola = g.magnitud > 0 && g.magnitud <= RELOJ_DEL_FINAL.colaDelGesto * G.pico') && c.includes('const d = decidirElGesto(s.reloj, alFondo, g.sentido, g.nuevo, G.retenido, ahora - G.desde, enLaCola)') && c.includes('if (d.rebobina) G.rebobinar = true') &&
  c.includes('else if (ahora - G.arriba > RELOJ_DEL_FINAL.cambioDeSentidoS) G.abajo = ahora') && c.includes('const rebobinar = s.gestos.rebobinar') && c.includes('s.gestos.rebobinar = false')
afirmar(cableadoA1(gestos, cuadro), '  el cableado: los gestos marcan si empiezan (la tecla, sin su repetición; el dedo, al apoyarse); el final retiene y pide el rebobinado con eso, y un gesto hacia abajo pegado a uno hacia arriba (el temblor de un dedo al levantarse) no la vuelve a correr')
controlPositivo('  el detector VE el temblor hacia abajo contado', [gestos, cuadro.replace('else if (ahora - G.arriba > RELOJ_DEL_FINAL.cambioDeSentidoS) G.abajo = ahora', 'else G.abajo = ahora')] as const, ([g, c]: readonly [string, string]) => cableadoA1(g, c))

// ═══════════════════════════════════════════════════════════════════════════
titulo('A2 · Viajes con la cinemática avanzada: se deshace con tope y después se viaja; sin saltos de cámara; velocidad con tope')

interface Salida { readonly s: number; readonly camaraPorCuadro: number; readonly finPorCuadro: number }
/** Desde el final entero, un viaje del menú: cuánto tarda en volver a cero y lo más que se mueve la cámara (su subida) en un cuadro. */
const salida = (paso: PasoDelReloj): Salida => {
  const r = entero(paso)
  let camaraPorCuadro = 0
  let finPorCuadro = 0
  for (let i = 1; i <= 600; i += 1) {
    const [antes, k] = [r.fin, subida(r.fin)]
    paso(r, { ...AL_FONDO, enViaje: true }, DT)
    camaraPorCuadro = Math.max(camaraPorCuadro, Math.abs(subida(r.fin) - k))
    finPorCuadro = Math.max(finPorCuadro, Math.abs(r.fin - antes))
    if (r.fin === 0) return { s: i * DT, camaraPorCuadro, finPorCuadro }
  }
  return { s: Number.POSITIVE_INFINITY, camaraPorCuadro, finPorCuadro }
}
const salidaBien = (x: Salida): boolean => x.s < 3 && x.camaraPorCuadro <= (1.25 * DT) / R.salida.camaraS && x.finPorCuadro <= (1.05 * DT) / R.salida.finS
const sa = salida(pasoDelReloj)
afirmar(salidaBien(sa), 'un viaje del menú (o salir del fondo) deshace la cinemática con tope: la cámara (su subida) a lo sumo de punta a punta en 1,2 s, `fin` en 1,2 s; vuelve a cero en menos de 3 s, sin saltos', `${sa.s.toFixed(2)} s · cámara ${(sa.camaraPorCuadro * 60).toFixed(2)}/s como mucho`)
const comoAntes: PasoDelReloj = (r, e, dt) => {
  pasoDelReloj(r, e, dt)
  if (e.enViaje && r.fin > 0) r.fin = Math.max(0, r.fin - dt / 0.35)
}
controlPositivo('el detector VE la vuelta de antes (0,35 s: la cámara bajaba del cenit 10 u por cuadro)', comoAntes, (p: PasoDelReloj) => salidaBien(salida(p)))

// El giro y el alejamiento del quieto vuelven con tope, sin pasarse, en un tiempo finito.
const vuelta = (paso: typeof haciaCero, desde: number, maxima: number, freno: number): { readonly s: number; readonly maxima: number; readonly cruzo: boolean } => {
  let [x, v, mayor, cruzo] = [desde, 0, 0, false]
  for (let i = 1; i <= 600; i += 1) {
    const r = paso(x, v, maxima, freno, DT)
    if (Math.sign(r.x) === -Math.sign(desde)) cruzo = true
    ;[x, v] = [r.x, r.v]
    mayor = Math.max(mayor, Math.abs(v))
    if (x === 0) return { s: i * DT, maxima: mayor, cruzo }
  }
  return { s: Number.POSITIVE_INFINITY, maxima: mayor, cruzo }
}
const Q = FINAL_DEL_PIE.quieto.vuelta
const vueltaBien = (f: typeof haciaCero): boolean => {
  const giro = vuelta(f, -180, Q.giroS, Q.giroFreno)
  const aleja = vuelta(f, FINAL_DEL_PIE.quieto.alejaHasta, Q.alejaS, Q.alejaFreno)
  return giro.s < 3 && giro.maxima <= Q.giroS + 1e-9 && !giro.cruzo && aleja.s < 3 && aleja.maxima <= Q.alejaS + 1e-9 && !aleja.cruzo
}
afirmar(vueltaBien(haciaCero), '  el giro del quieto (aun media vuelta) y su alejamiento vuelven a cero con tope (90°/s, 9 u/s) y frenando, sin pasarse, en menos de 3 s (antes: 400°/s al arrancar y una cola de segundos)')
const exponencial: typeof haciaCero = (x, _v, _m, _f, dt) => {
  const nx = Math.abs(x * Math.exp(-dt / 0.45)) < 1e-3 ? 0 : x * Math.exp(-dt / 0.45)
  return { x: nx, v: (nx - x) / dt }
}
controlPositivo('  el detector VE la exponencial de antes', exponencial, vueltaBien)
const q = { giro: 170, aleja: 6, giroV: 4.5, alejaV: 0.1 }
for (let i = 0; i < 240; i += 1) relojDelQuieto(0, false, 0, DT, q)
afirmar(q.giro === 0 && q.aleja === 0 && q.giroV === 0, '  y el reloj del quieto la usa (desde 170° y 6 u, en 4 s: cero)')

// La cámara del final con el ENCUADRE del recorrido: con `k` 0 y el giro que vuelve, la del rig (no la centrada en el logo).
const delRig = (): THREE.PerspectiveCamera => {
  const c = new THREE.PerspectiveCamera(35, 1440 / 900, 0.1, 400)
  c.position.set(Math.sin(2.88) * 17.9, 8.2, Math.cos(2.88) * 17.9)
  c.lookAt(0, ORBIT_TARGET_Y, 0)
  aimWithFraming(c, 1440 / 900, 6.86, 4.78, Math.hypot(17.9, 8.2 - ORBIT_TARGET_Y), -0.494, 0)
  c.updateMatrixWorld()
  return c
}
const blanco = new THREE.Vector3(0, -4, 0)
type CamaraDelFinal = typeof camaraDelFinal
const angulo = (a: THREE.Camera, b: THREE.Camera): number => THREE.MathUtils.radToDeg(a.quaternion.angleTo(b.quaternion))
const encuadreBien = (f: CamaraDelFinal): boolean => {
  const rig = delRig()
  const casiSinGiro = delRig()
  f(casiSinGiro, 0, blanco, 1e-4, 0, null)
  // La subida, en 200 pasos, desde la del rig: sin saltos.
  let peor = 0
  let antes = delRig()
  for (let i = 1; i <= 200; i += 1) {
    const c = delRig()
    f(c, i / 200, blanco, 0, 0, null)
    peor = Math.max(peor, angulo(c, antes))
    antes = c
  }
  const arriba = delRig()
  f(arriba, 1, blanco, 0, 0, null)
  const alBlanco = blanco.clone().sub(arriba.position).normalize().dot(arriba.getWorldDirection(new THREE.Vector3()))
  return angulo(casiSinGiro, rig) < 0.01 && peor < 2 && alBlanco > 0.9999
}
afirmar(encuadreBien(camaraDelFinal), '  la cámara del final conserva el ENCUADRE del recorrido: con el giro del quieto volviendo es la del rig (no la centrada en el logo, que saltaba 8° al soltarse); arriba, centrada en el logo; la subida sin saltos')
const centrada: CamaraDelFinal = (c, k, b, giro, aleja, sacudon) => {
  camaraDelFinal(c, k, b, giro, aleja, sacudon)
  if (k <= 0 && giro === 0 && aleja === 0) return
  c.lookAt(new THREE.Vector3(0, ORBIT_TARGET_Y, 0).lerp(b, k))
  c.updateMatrixWorld()
}
controlPositivo('  el detector VE la cámara de antes (mira al centro de la órbita y tira el encuadre)', centrada, encuadreBien)

// El viaje espera a la escena: no mueve el scroll hasta que el final está en reposo.
const efecto = sinComentarios(leer('_componentes/useDeslizamientoDelCta.ts'))
const componenteDelFinal = sinComentarios(leer('_lib/escena/final/FinalDelPie.tsx'))
const esperaBien = (ef: string): boolean =>
  ef.includes('if (!FINAL_EN_REPOSO.valor && performance.now() - desdeElClick < PRELUDIO_MS + ESPERA_MAXIMA_DEL_FINAL_MS) {') && ef.includes('relojDeArranque = window.setTimeout(arrancar, 50)') &&
  cuadro.includes('FINAL_EN_REPOSO.valor = !activo') && componenteDelFinal.includes('FINAL_EN_REPOSO.valor = true')
afirmar(esperaBien(efecto), '  el viaje desde el pie con la cinemática avanzada espera a que la escena la deshaga (el final en reposo; a lo sumo 3,5 s, por si la escena no dibuja) y recién ahí mueve el scroll; el reloj de seguridad cubre esa espera')
controlPositivo('  el detector VE un viaje que no espera (la cámara bajaría del cenit mientras el scroll ya vuela)', efecto.replace('if (!FINAL_EN_REPOSO.valor && performance.now() - desdeElClick < PRELUDIO_MS + ESPERA_MAXIMA_DEL_FINAL_MS) {', 'if (false) {'), esperaBien)

// La velocidad con tope: el mínimo de siempre para los cortos; los largos tardan más, sin pasar 4,5 pantallas por segundo.
const velocidadBien = (f: typeof duracionDelViaje): boolean => {
  const alto = 900
  const distancias = Array.from({ length: 60 }, (_, i) => 300 + i * 600)
  const duraciones = distancias.map((d) => f(d, alto))
  const monotona = duraciones.every((d, i) => i === 0 || d >= duraciones[i - 1])
  const conTope = distancias.every((d, i) => duraciones[i] >= VIAJE_CON_TOPE.maximoMs - 1e-9 || d / alto / (duraciones[i] / 1000) <= VIAJE_CON_TOPE.pantallasPorS + 1e-9)
  return f(900, alto) === DURACION_DEL_VIAJE_MS && f(-900, alto) === DURACION_DEL_VIAJE_MS && monotona && conTope && f(31_000, alto) > DURACION_DEL_VIAJE_MS && duraciones.every((d) => d <= VIAJE_CON_TOPE.maximoMs)
}
afirmar(velocidadBien(duracionDelViaje), 'la velocidad con tope: los viajes cortos duran lo de siempre; los largos, más (a lo sumo 4,5 pantallas por segundo en promedio), hasta 7 s', `«Inicio» desde el pie a 1440×900: ${(duracionDelViaje(31_070, 900) / 1000).toFixed(1)} s`)
controlPositivo('  el detector VE la duración fija de antes (31.000 px en 2,6 s: 13 pantallas por segundo)', (() => DURACION_DEL_VIAJE_MS) as typeof duracionDelViaje, velocidadBien)

// Un cuadro largo no hace saltar el viaje: el reloj avanza a lo sumo `TOPE_DEL_CUADRO_DEL_VIAJE_MS` por cuadro.
/** El paso de scroll más grande de un cuadro normal y el del cuadro largo (un tirón de 120 ms a mitad de camino). */
function conUnTiron(viajar: typeof viajarSinLenis): { readonly normal: number; readonly tiron: number } {
  const cola: FrameRequestCallback[] = []
  let reloj = 0
  let termino = false
  const ventana = { scrollY: 0, scrollTo: (_x: number, y: number) => { ventana.scrollY = y } }
  const antes = { window: globalThis.window, raf: globalThis.requestAnimationFrame, caf: globalThis.cancelAnimationFrame, now: performance.now }
  Object.assign(globalThis, { window: ventana, requestAnimationFrame: (f: FrameRequestCallback) => cola.push(f), cancelAnimationFrame: () => undefined })
  Object.defineProperty(performance, 'now', { value: () => reloj, configurable: true })
  let [normal, tiron] = [0, 0]
  try {
    viajar(30_000, 7000, CURVA_DEL_VIAJE, () => { termino = true })
    for (let i = 0; i < 2000 && !termino; i += 1) {
      const largo = i === 200
      reloj += largo ? 120 : 1000 / 60
      const y0 = ventana.scrollY
      cola.splice(0).forEach((f) => f(reloj))
      const paso = Math.abs(ventana.scrollY - y0)
      if (largo) tiron = paso
      else normal = Math.max(normal, paso)
    }
  } finally {
    Object.assign(globalThis, { window: antes.window, requestAnimationFrame: antes.raf, cancelAnimationFrame: antes.caf })
    Object.defineProperty(performance, 'now', { value: antes.now, configurable: true })
  }
  return { normal, tiron }
}
const tironBien = (f: typeof viajarSinLenis): boolean => {
  const { normal, tiron } = conUnTiron(f)
  return normal > 0 && tiron <= normal * (TOPE_DEL_CUADRO_DEL_VIAJE_MS / (1000 / 60)) * 1.02
}
const tir = conUnTiron(viajarSinLenis)
afirmar(tironBien(viajarSinLenis), 'un cuadro largo (un tirón de 120 ms a mitad de camino) no hace saltar el viaje: avanza a lo sumo lo de 34 ms (dos cuadros), no los 120', `cuadro normal ${tir.normal.toFixed(0)} px · el del tirón ${tir.tiron.toFixed(0)} px`)
const deParedSinTope: typeof viajarSinLenis = (destino, duracionMs, curva, alTerminar) => {
  const salidaY = window.scrollY
  const arranque = performance.now()
  let vivo = true
  const c = (): void => {
    if (!vivo) return
    const t = Math.min(1, (performance.now() - arranque) / duracionMs)
    window.scrollTo(0, salidaY + (destino - salidaY) * curva(t))
    if (t < 1) requestAnimationFrame(c)
    else {
      vivo = false
      alTerminar()
    }
  }
  requestAnimationFrame(c)
  return () => {
    vivo = false
  }
}
controlPositivo('  el detector VE el reloj de pared sin tope (el tirón saltaba 800 px de página y 17° de cámara)', deParedSinTope, tironBien)
// Y lo mismo con Lenis (su reloj, en el viaje) y en la inercia de la cámara.
const scrollSuave = sinComentarios(leer('_componentes/ScrollSuaveDeV3.tsx'))
const rig = sinComentarios(leer('_lib/escena/OrbitRig.tsx'))
const topesBien = (ss: string, rg: string): boolean =>
  ss.includes('reloj = reloj < 0 ? tiempo : reloj + (viajeEnCurso() === null ? tiempo - tReal : Math.min(tiempo - tReal, TOPE_DEL_CUADRO_DEL_VIAJE_MS))') && ss.includes('lenis.raf(reloj)') &&
  rg.includes('const pasoDeLaInercia = Math.min(delta, TOPE_DEL_CUADRO_DEL_VIAJE_MS / 1000)') && /SETTLE_EPSILON\[channel\],\s*pasoDeLaInercia/.test(rg)
afirmar(topesBien(scrollSuave, rig), '  con Lenis, su reloj en un viaje avanza con el mismo tope; y la inercia de la cámara también (con 100 ms de delta recuperaba de golpe lo que venía atrás)')
controlPositivo('  el detector VE a Lenis con el reloj de pared', [scrollSuave.replace('lenis.raf(reloj)', 'lenis.raf(tiempo)'), rig] as const, ([ss, rg]: readonly [string, string]) => topesBien(ss, rg))

// ═══════════════════════════════════════════════════════════════════════════
titulo('A3 · Portfolio desde el menú: nada de las Demos al llegar (su aparición no persigue al scroll en un viaje)')

// La aparición de las Demos persigue al scroll con un tope (1,8 s de punta a punta): en un viaje que las cruza, al llegar a
// Portfolio seguían a medio irse y su título 3D entraba y salía apenas terminaba el viaje. En un viaje, lo mostrado ES lo
// pedido (el `<main>` está apagado: no hay nada que ver de la persecución).
const capaDeDemos = sinComentarios(leer('_secciones/trabajos/demos/CapaDeDemos.tsx'))
const demosSinPersecucion = (c: string): boolean => /p\.pedida = aparicionPedida\(valor, rigida\.current\)\s*if \(viajeEnCurso\(\) !== null\) \{\s*alcanzar\(p\)\s*llegar\(p\.mostrada\)\s*return\s*\}\s*perseguir\(p, llegar\)/.test(c)
afirmar(demosSinPersecucion(capaDeDemos), 'en un viaje del menú la aparición de las Demos alcanza lo pedido en el acto (al llegar a Portfolio está en cero: su título, su párrafo y sus libros no entran ni salen)')
controlPositivo('el detector VE la persecución de siempre en un viaje', capaDeDemos.replace(/if \(viajeEnCurso\(\) !== null\) \{\s*alcanzar\(p\)\s*llegar\(p\.mostrada\)\s*return\s*\}/, ''), demosSinPersecucion)
// Y los títulos de volumen, en un viaje, desarmados (la regla de 3D Y SONIDO T1, que esto completa).
const titulos = sinComentarios(leer('_lib/escena/titulos3d/TitulosDeVolumen.tsx'))
afirmar(titulos.includes('a.mostrado.llegada = mostradoDelScroll(a.mostrado.llegada, enViaje ? 0 : a.titulo.llegada, asentar, dt, enViaje ? null : a.titulo.minimoS, a.titulo.asiento)'), '  y en un viaje los títulos de volumen van desarmados, sin mínimo: al terminar llegan desde lo que pide el scroll del destino')

// ═══════════════════════════════════════════════════════════════════════════
titulo('A4 · La sombra cuadrada: en un viaje la altura del sol es la de su luz; las piezas del pie no proyectan sombra')

// La «sombra cuadrada» que aparecía usando el menú era la del LOGO, estirada por todo el piso: en un viaje de día la luz
// tiene la fuerza del día (`viaje.ts`), pero la altura del sol seguía al arco del recorrido (en la noche de Trabajos, 3°):
// una sombra de 17 veces su alto. En un viaje, la altura es la que le corresponde a su nivel (`elevacionDe`).
const orbit = sinComentarios(leer('_lib/escena/OrbitRig.tsx'))
// (Después del nivel con la interfaz y del atardecer del final, B2: la altura es la del nivel que queda.)
const alturaDelViaje = (c: string): boolean => {
  const linea = c.indexOf('if (viajeEnCurso() !== null) arc.elevationDeg = elevacionDe(arc.level)')
  return linea > c.indexOf('arc.level = nivelConLaInterfaz(arc.level, Math.min(delta, 0.1))') && linea > c.indexOf('arc.level *= 1 - ATARDECER_DEL_FINAL.nivel * tarde') && c.indexOf('arc.level *= 1 - ATARDECER_DEL_FINAL.nivel * tarde') > 0
}
const largoDeLaSombra = (grados: number): number => 1 / Math.tan(THREE.MathUtils.degToRad(grados))
afirmar(alturaDelViaje(orbit) && elevacionDe(1) === 36 && largoDeLaSombra(elevacionDe(1)) < 1.4 && largoDeLaSombra(elevacionDe(0.1)) > 15, 'en un viaje del menú la altura del sol es la de su nivel (de día, 36°: la sombra del logo mide 1,4 veces su alto), no la del recorrido (en la noche de Trabajos, 3°: 17 veces, por todo el piso)', `de día ${largoDeLaSombra(elevacionDe(1)).toFixed(2)}× · con la del recorrido ${largoDeLaSombra(elevacionDe(0.1)).toFixed(1)}×`)
controlPositivo('el detector VE la altura del recorrido en un viaje', orbit.replace('if (viajeEnCurso() !== null) arc.elevationDeg = elevacionDe(arc.level)', ''), alturaDelViaje)
// Las piezas del pie no proyectan sombra sobre la escena (sus sombras de contacto en el piso vivo, apagadas).
const armadasDelPie = sinComentarios(leer('_lib/escena/pie3d/armadas.ts'))
const sinSombrasDelPie = (c: string): boolean => c.includes('SOMBRAS_DEL_PIE.uCuantasSombrasDelPie.value = 0') && !c.includes('sombraDe(') && !c.includes('uSombrasDelPie.value[')
afirmar(sinSombrasDelPie(armadasDelPie), '  las placas y piezas del pie no proyectan sombra sobre la escena (ninguna sombra de contacto en el piso vivo); fuera de su sección no se dibujan (ya: sólo con su caja a la vista)')
controlPositivo('  el detector VE las sombras de contacto de antes', armadasDelPie.replace('SOMBRAS_DEL_PIE.uCuantasSombrasDelPie.value = 0', 'if (sombras < MAXIMO_DE_SOMBRAS_DEL_PIE) sombras = sombraDe(a, sombras)'), sinSombrasDelPie)
afirmar(/a\.grupo\.visible = arriba \+ c\.abajo > -MARGEN && arriba \+ c\.arriba < cuadro\.alto \+ MARGEN/.test(armadasDelPie), '  y una pieza del pie se dibuja sólo con su caja del DOM a la vista (con el margen)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('A5 · Teléfono: al pasar a las Demos la escena de atrás no se congela')

// Abajo de 1024 las ventanas de la escena (en pantallas del escritorio) daban por tapada la sala en las Demos, que en el
// teléfono la dejan ver: la escena se suspendía y quedaba su último cuadro, congelado. Ahí se dibuja salvo que el bloque
// opaco (Servicios y Tu panel, seguidos) tape el cuadro entero.
const atadura = sinComentarios(leer('_lib/escena/ataduraAlScroll.ts'))
const enElTelefono = (c: string): boolean => c.includes('const elBloque = medirElBloqueOpacoEn(document, ventana, bloque)') && /escenaEnCuadro\(\s*medida\.y,\s*secciones\.arriba,\s*medida\.abajo,\s*ventana,\s*\) \|\|\s*\(window\.innerWidth < 1024 && elBloque !== null && !bloqueTapaElCuadro\(elBloque\)\)/.test(c)
const caja = (tope: number, pie: number): { tope: number; pie: number } => ({ tope, pie })
const tapa = bloqueTapaElCuadro({ servicios: caja(-400, 2000), tuPanel: caja(2000, 5000), alto: 844 }) && bloqueTapaElCuadro({ servicios: caja(-3000, -10), tuPanel: caja(-10, 900), alto: 844 })
const enLasDemos = !bloqueTapaElCuadro({ servicios: caja(500, 3000), tuPanel: caja(3000, 6000), alto: 844 }) && !bloqueTapaElCuadro({ servicios: caja(-6000, -3000), tuPanel: caja(-3000, 300), alto: 844 })
afirmar(enElTelefono(atadura) && tapa && enLasDemos, 'abajo de 1024 la escena se dibuja mientras se vea algo de la sala (en las Demos, translúcidas, ya no se congela) y se suspende sólo con Servicios y Tu panel tapando el cuadro entero')
controlPositivo('el detector VE la regla de antes (sólo las ventanas del escritorio)', atadura.replace(/ \|\|\s*\(window\.innerWidth < 1024 && elBloque !== null && !bloqueTapaElCuadro\(elBloque\)\)/, ''), enElTelefono)

// ═══════════════════════════════════════════════════════════════════════════
titulo('A6 · «Hablemos» del hero abre el panel de contacto (no lleva al pie)')

// El chrome atiende los `[data-abre-contacto]` en la captura, antes que el viaje: los de `panel` abren la hoja
// (`_chrome/contacto/apertura.ts`). «Hablemos» lo lleva; su `href` (`#contacto`) queda para cuando no hay JavaScript.
const heroHtml = marcar(<Hero seccion={seccionDe('hero')} />, { anima: false })
const hablemos = (h: string): boolean => new RegExp(`<a href="#contacto"[^>]*data-abre-contacto="${ABRE_EL_PANEL}"[^>]*>`).test(h) && (h.match(/data-abre-contacto=/g) ?? []).length === 1
afirmar(hablemos(heroHtml) && CONTENIDO_DEL_HERO.ctaContacto.abre === ABRE_EL_PANEL, '«Hablemos» abre el PANEL de contacto, como el Contacto de la barra (y sólo él: «Mirá los trabajos» sigue viajando)')
controlPositivo('el detector VE el «Hablemos» que viajaba al pie', heroHtml.replace(` data-abre-contacto="${ABRE_EL_PANEL}"`, ''), hablemos)

// ═══════════════════════════════════════════════════════════════════════════
titulo('A7 · «Quiero mi…» de Servicios abre el panel de contacto con su opción marcada')

// Los dos CTA de Servicios (el que rota, desde 1024, y el de cada servicio, en la rama apilada) abren la HOJA con la
// precarga de su servicio en «¿Qué querés hacer?» (antes viajaban al formulario del pie, sin marcar nada).
const ctasDeServicios = ['_secciones/servicios/CtaDelServicio.tsx', '_secciones/servicios/CtaQueRota.tsx'].map((r) => sinComentarios(leer(r)))
const abrenElPanel = (fs: readonly string[]): boolean => fs.every((f) => f.includes(`data-abre-contacto="${ABRE_EL_PANEL}"`) && /data-precarga=\{/.test(f))
const mapeo = PRECARGA_POR_SERVICIO.web.join() === 'web' && PRECARGA_POR_SERVICIO.software.join() === 'software' && PRECARGA_POR_SERVICIO['ia-automatizacion'].join() === 'chatbot,automatizaciones'
const rotulo = (id: string): string => INTERESES.find((i) => i.id === id)?.rotulo ?? '?'
afirmar(abrenElPanel(ctasDeServicios) && mapeo, 'los «Quiero mi…» abren el panel con su opción marcada: web → «Una página web», software → «Software a medida», IA → «Un chatbot con IA» y «Automatizaciones»', [rotulo('web'), rotulo('software'), rotulo('chatbot'), rotulo('automatizaciones')].join(' · '))
controlPositivo('el detector VE los CTA que viajaban al pie', ctasDeServicios.map((f) => f.replace(`data-abre-contacto="${ABRE_EL_PANEL}"`, 'data-abre-contacto=""')), abrenElPanel)

// ═══════════════════════════════════════════════════════════════════════════
titulo('B1 · El intro del logo: cae desde arriba y llega cuando termina de armarse el titular; la súper onda')

// La caída: arriba (fuera del cuadro) mientras se arma el titular; después cae con gravedad (cada vez más rápido) y llega
// exactamente al terminar el armado: los dos con el mismo reloj, desde que se abre la carga.
const heroFuente = leer('_secciones/hero/Hero.tsx')
const delTitular = Number(/const LLEGADA_DEL_TITULAR_S = ([0-9.]+)/.exec(heroFuente)?.[1] ?? Number.NaN)
const caidaBien = (h: typeof alturaDeLaCaida): boolean => {
  const muestras = Array.from({ length: 201 }, (_, i) => h(i / 200))
  const baja = muestras.every((y, i) => i === 0 || y <= muestras[i - 1] + 1e-12)
  const acelera = muestras.slice(Math.ceil(CAIDA_DEL_LOGO.espera * 200) + 2).every((_, k, arr) => k < 2 || arr[k] - arr[k - 1] <= arr[k - 1] - arr[k - 2] + 1e-9)
  return h(0) === CAIDA_DEL_LOGO.alto && h(CAIDA_DEL_LOGO.espera) === CAIDA_DEL_LOGO.alto && h(1) === 0 && h(0.999) > 0 && baja && acelera
}
afirmar(caidaBien(alturaDeLaCaida) && CAIDA_DEL_LOGO.duracionS === delTitular, 'el logo espera arriba, cae con gravedad (cada vez más rápido) y llega a su lugar justo cuando termina de armarse el titular (el mismo reloj: lo que tarda el titular en armarse)', `${String(CAIDA_DEL_LOGO.duracionS)} s · desde ${String(CAIDA_DEL_LOGO.alto)} u`)
controlPositivo('el detector VE una caída que llega antes que el titular', ((u: number) => alturaDeLaCaida(Math.min(1, u * 1.3))) as typeof alturaDeLaCaida, caidaBien)
const caidaTsx = sinComentarios(leer('_lib/escena/intro/CaidaDelLogo.tsx'))
const escenario = sinComentarios(leer('_lib/escena/ProbeStage.tsx'))
const montada = (c: string, e: string): boolean => c.includes('if (cargaLista()) s.u = Math.min(1, s.u + Math.min(Math.max(delta, 0), 0.1) / CAIDA_DEL_LOGO.duracionS)') && c.includes('FINAL_EN_EL_PISO.uGolpe.value.set(VIVO.uTiempo.value, logo.position.x, logo.position.z, 1)') && c.includes('window.scrollY >= window.innerHeight * CAIDA_DEL_LOGO.arriba') && e.includes('{!reducedMotion && <CaidaDelLogo logoGroupRef={logoGroupRef} />}')
afirmar(montada(caidaTsx, escenario), '  arranca con la carga abierta, sólo si la página cargó arriba (si no, el logo ya está en su lugar), al llegar hace la súper onda desde el logo, y con movimiento reducido no se monta (ni caída ni onda)')
controlPositivo('  el detector VE una caída con movimiento reducido', [caidaTsx, escenario.replace('{!reducedMotion && <CaidaDelLogo logoGroupRef={logoGroupRef} />}', '<CaidaDelLogo logoGroupRef={logoGroupRef} />')] as const, ([c, e]: readonly [string, string]) => montada(c, e))
// La súper onda: la del golpe (la misma del encastre), mucho más grande que antes y dibujada más alta que el tope de siempre.
const sim = conElFinalEnLaSimulacion(conOndaDirigida(SIMULACION_GLSL))
const G = GOLPE_EN_EL_PISO
type Golpe = { readonly alcance: number; readonly fuerza: number; readonly ancho: number; readonly masAlta: number }
const superOnda = (g: Golpe, s: string): boolean => g.alcance >= 1.7 * 32 && g.fuerza >= 1.6 * 70 && g.ancho >= 1.5 * 1.3 && g.masAlta >= 2 * 0.42 && /float topeDeLaOnda = topeConElGolpe\( [0-9.]+ \);\s*float onda = topeDeLaOnda \* tanh\( nueva \/ topeDeLaOnda \);/.test(s)
afirmar(superOnda(G, sim), '  la súper onda (la de la llegada y la del encastre): llega casi el doble de lejos, más fuerte y más ancha, y se dibuja hasta 1 u más alta que el tope de las ondas de siempre (0,42)', `${String(G.alcance)} u · ${String(G.fuerza)} · ${String(G.ancho)} u · +${String(G.masAlta)} u`)
controlPositivo('  el detector VE el golpe de antes', [{ alcance: 32, fuerza: 70, ancho: 1.3, masAlta: 0 }, sim] as readonly [Golpe, string], ([g, s]: readonly [Golpe, string]) => superOnda(g, s))
// Y la sombra del logo se va con el logo en el aire (cayendo, lejos del piso, cruzaba el cuadro estirada).
const luzDelLogo = sinComentarios(leer('_lib/escena/LuzDelLogo.tsx'))
afirmar(luzDelLogo.includes('* (1 - enElAire)') && /const enElAire = Math\.min\(1, Math\.max\(0, \(logo\.position\.y - SOMBRA_DEL_LOGO\.aire\[0\]\)/.test(luzDelLogo), '  y la sombra del logo se apaga con el logo en el aire (cayendo, lejos del piso, se estiraba por el cuadro)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('B2 · El piso volcán: el mouse sólo levanta; destellos de lava al azar por las juntas de todo el piso; el atardecer parejo')

// El dibujo del piso de verdad (el material con el final inyectado).
const dibujoDelPisoB2 = (() => {
  const material = conElFinalEnElPiso(new THREE.MeshStandardMaterial())
  const sombreador = { fragmentShader: [ANCLAS_DEL_DIBUJO.funcion, ...Object.values(ANCLAS_DEL_HUECO)].join('\n'), vertexShader: '', uniforms: {} as Record<string, THREE.IUniform> }
  material.onBeforeCompile(sombreador as unknown as THREE.WebGLProgramParametersWithUniforms, {} as THREE.WebGLRenderer)
  material.dispose()
  return sombreador.fragmentShader
})()
const L = LAVA_EN_EL_PISO
// La lava, simulada en JS con la misma cuenta del sombreador: en el piso entero, focos que se encienden y se apagan (nunca
// todos a la vez), núcleo y halo gaussianos (sin anillos: decrece con la distancia al foco).
const azar = (x: number, y: number): number => {
  let [a, b, c] = [x * 0.1031, y * 0.1031, x * 0.1031].map((v) => v - Math.floor(v))
  const d = a * (b + 33.33) + b * (c + 33.33) + c * (a + 33.33)
  ;[a, b, c] = [a + d, b + d, c + d]
  const v = (a + b) * c
  return v - Math.floor(v)
}
const focosEncendidos = (t: number): number => {
  let n = 0
  for (let i = -5; i <= 5; i += 1) {
    for (let j = -5; j <= 5; j += 1) {
      const semilla = azar(i + 19.7, j + 19.7)
      const periodo = L.periodo[0] + (L.periodo[1] - L.periodo[0]) * semilla
      const f = (t / periodo + azar(i + 3.17, j + 3.17)) % 1
      if (f / L.encendido < 1) n += 1
    }
  }
  return n
}
const encendidos = Array.from({ length: 60 }, (_, k) => focosEncendidos(k * 0.37))
const nuncaTodos = encendidos.every((n) => n > 0 && n < 121) && Math.max(...encendidos) - Math.min(...encendidos) >= 3
const lavaBien = (g: string): boolean => {
  const juntas = g.slice(g.indexOf('vec3 conLasJuntas( vec3 color, vec2 xz ) {'))
  return g.includes('vec2 lavaEn( vec2 xz, float t ) {') && g.includes('halo = max( halo, a * exp( - d2 / ( r * r ) ) );') && g.includes('nucleo = max( nucleo, a * exp( - d2 / ') && g.includes('float px = length( fwidth( vPiso.xz ) );') &&
    juntas.includes('float energia = min( 1.0, uPoder ) * fueraDeLaCalma( xz );') && !g.includes('uRastro') && !g.includes('resplandorDelRastro')
}
afirmar(lavaBien(dibujoDelPisoB2) && nuncaTodos && L.color.halo[0] === 1 && L.color.nucleo[1] > L.color.halo[1], 'después del encastre, destellos de lava al azar por las juntas de TODO el piso: focos que pulsan, se encienden y se apagan, nunca todos a la vez; núcleo intenso y halo suave, gaussianos (por foco, el más fuerte: sin manchas ni anillos), sin dientes (un píxel como mínimo); el mouse ya no hace brillo (sólo levanta los bloques)', `encendidos de 121: ${String(Math.min(...encendidos))} a ${String(Math.max(...encendidos))}`)
controlPositivo('el detector VE un brillo que no espera al encastre', dibujoDelPisoB2.replace('float energia = min( 1.0, uPoder ) * fueraDeLaCalma( xz );', 'float energia = fueraDeLaCalma( xz );'), lavaBien)
controlPositivo('  y el brillo bajo el mouse de antes', `${dibujoDelPisoB2}\nvec2 resplandorDelRastro( vec2 xz ) { return vec2( 0.0 ); }`, lavaBien)
// El atardecer: la sala ENTERA (el nivel y la temperatura del rig de luz: las luces, el ambiente, la niebla, el fondo) baja
// y se entibia después del encastre; función de `fin` (al rebobinar, vuelve).
const rigB2 = sinComentarios(leer('_lib/escena/OrbitRig.tsx'))
const atardecerBien = (c: string): boolean => /const tarde = atardecer\(EN_VIVO\.fin\)\s*if \(tarde > 0\) \{\s*arc\.level \*= 1 - ATARDECER_DEL_FINAL\.nivel \* tarde\s*arc\.kelvin \+= \(ATARDECER_DEL_FINAL\.kelvin - arc\.kelvin\) \* tarde/.test(c)
const alRas = FINAL_DEL_PIE.presion.hastaS / R.duracionS
afirmar(atardecerBien(rigB2) && atardecer(0) === 0 && atardecer(alRas - 0.01) === 0 && atardecer(1) === 1 && ATARDECER_DEL_FINAL.nivel < 0.6, '  para que se lea, toda la sala atardece pareja después del encastre (el rig de luz entero: nunca un sector) y vuelve al rebobinar', `−${String(ATARDECER_DEL_FINAL.nivel * 100)} % · ${String(ATARDECER_DEL_FINAL.kelvin)} K`)
controlPositivo('  el detector VE un atardecer que no está en el rig', rigB2.replace('arc.level *= 1 - ATARDECER_DEL_FINAL.nivel * tarde', ''), atardecerBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('B3 · El círculo estable: alrededor del logo, liso y quieto, sin bordes; no reacciona al mouse ni a las ondas')

// Un CÍRCULO (antes una elipse angosta en la caja del logo, que sólo ocultaba el dibujo: el rectángulo hundido en
// escalones), de radio acorde (el logo y un margen, no mucho más) y con un borde ancho y suave (varios bloques: sin
// escalones). Adentro, quieto de verdad: los empujes (el mouse, el pulso, el golpe, las ondas) se apagan con la calma y la
// onda se amortigua; y el logo no larga anillos durante el final.
const C = CALMA_EN_EL_PISO
const mitadDelLogo = 6.86 / 2
const simB3 = conElFinalEnLaSimulacion(conOndaDirigida(SIMULACION_GLSL))
type Calma = { readonly radio: number; readonly borde: number; readonly amortigua: number }
const circuloBien = (sim: string, dib: string, c: Calma): boolean =>
  sim.includes(`return uCalmaDelFinal * ( 1.0 - smoothstep( ${c.radio.toFixed(1)}, ${(c.radio + c.borde).toFixed(1)}, length( xz ) ) );`) &&
  /float calmaAqui = calmaDelFinal\( p \* uLado \);\s*fuerza \*= 1\.0 - calmaAqui;\s*amortigua \+= [0-9.]+ \* calmaAqui;/.test(sim) && sim.includes('dibujo *= 1.0 - calmaDelFinal( xz );') &&
  /return mix\( 1\.0, smoothstep\( [0-9.]+, [0-9.]+, length\( xz \) \), uCalmaDelFinal \);/.test(dib) &&
  c.radio > mitadDelLogo && c.radio < 1.6 * mitadDelLogo && c.borde >= 4 * 0.8 && c.amortigua >= 10
afirmar(circuloBien(simB3, dibujoDelPisoB2, C), 'una vez encastrado, alrededor del logo un CÍRCULO liso y quieto (de radio acorde: el logo y un margen) con un borde ancho y suave (sin escalones ni el rectángulo hundido): adentro los empujes del mouse, del pulso, del golpe y de las ondas se apagan y los bloques se asientan; la lava empieza afuera', `radio ${String(C.radio)} u · borde ${String(C.borde)} u · ${String(C.amortigua)}/s más de amortiguación`)
controlPositivo('el detector VE la calma de antes (sólo ocultaba el dibujo: las olas seguían debajo)', [simB3.replace(/float calmaAqui = calmaDelFinal\( p \* uLado \);\s*fuerza \*= 1\.0 - calmaAqui;\s*amortigua \+= [0-9.]+ \* calmaAqui;/, ''), dibujoDelPisoB2, C] as readonly [string, string, Calma], ([si, di, c]: readonly [string, string, Calma]) => circuloBien(si, di, c))
controlPositivo('  y un borde angosto (escalones de bloque)', [simB3, dibujoDelPisoB2, { radio: C.radio, borde: 1.6, amortigua: C.amortigua }] as readonly [string, string, Calma], ([si, di, c]: readonly [string, string, Calma]) => circuloBien(si, di, c))
const entornoB3 = sinComentarios(leer('_lib/escena/entorno/Entorno.tsx'))
afirmar(entornoB3.includes('entradas.reducido = quieto || EN_VIVO.fin > 0'), '  y durante el final el logo no larga anillos del pulso (cruzaban el círculo quieto: anillos y ondas en escalones)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('B4 · El polvo en el pie: en la cinemática no se posa; el que cae no atraviesa las piezas del pie (un cupo se apoya)')

// En la cinemática la página está quieta (la cinemática es automática) y el polvo se posaba a los 4 s: ahora el final cuenta
// como movimiento (desde el logo) y el polvo sigue flotando como siempre.
const fisicaB4 = sinComentarios(leer('_lib/escena/polvo/Fisica.tsx'))
const flotaEnElFinal = (c: string): boolean => /if \(!hayOrigen && EN_VIVO\.fin > 0\) \{\s*m\.origen\[0\] = 0\s*m\.origen\[1\] = FLOOR_Y\s*m\.origen\[2\] = 0\s*hayOrigen = true\s*\}\s*if \(!hayOrigen && \(scroll \|\| cursor\)\) \{/.test(c)
afirmar(flotaEnElFinal(fisicaB4), 'durante la cinemática final el polvo no se posa ni cae: el final cuenta como movimiento (desde el logo) y sigue flotando como siempre')
controlPositivo('el detector VE el polvo que se posa en la cinemática (la página quieta)', fisicaB4.replace(/if \(!hayOrigen && EN_VIVO\.fin > 0\) \{[\s\S]*?hayOrigen = true\s*\}\s*/, ''), flotaEnElFinal)
// Lo que cae no atraviesa las piezas del pie (placas, botones, enlaces, el formulario; no el texto suelto): sale por una cara;
// por la de arriba se apoya un cupo (al azar, por mota), sólo si recién la cruzó (no salta desde el costado).
const simB4 = sinComentarios(leer('_lib/escena/polvo/simulacion.ts'))
const armadasB4 = sinComentarios(leer('_lib/escena/pie3d/armadas.ts'))
const choqueBien = (sim: string, ar: string, glsl: string): boolean =>
  /p \+= relajar\( v, objetivo, [^;]+;\s*chocarConElPie\( p, v, azar \);\s*if \( posarseEnElLogo\( p, antes \) \) \{/.test(sim) && sim.includes('${CAJAS_DEL_PIE_GLSL}') &&
  ar.includes("for (const a of s.armadas) if (a.grupo.visible && a.pieza.forma !== 'texto') cajas = escribirLaCaja(cajas, a.viaje.matrixWorld, a.caja)") &&
  glsl.includes('if ( arriba && apoya && h < 0.25 * medida ) { k = j; menor = -1.0; break; }') && glsl.includes('if ( arriba ) continue;') && glsl.includes('if ( hondo.x <= 0.0 || hondo.y <= 0.0 || hondo.z <= 0.0 ) continue;')
afirmar(choqueBien(simB4, armadasB4, CAJAS_DEL_PIE_GLSL) && POLVO_EN_EL_PIE.cupo <= 0.35 && POLVO_EN_EL_PIE.cajas >= 10, '  la mota que cae no atraviesa las piezas del pie (sale por la cara más cercana que no es la de arriba); por la de arriba se apoya sólo un cupo (no se acumula), y sólo si recién la cruzó; la apoyada queda frenada en su cara (si la pieza se mueve, la lleva)', `cupo ${String(POLVO_EN_EL_PIE.cupo * 100)} % · hasta ${String(POLVO_EN_EL_PIE.cajas)} piezas`)
controlPositivo('  el detector VE un polvo que atraviesa las piezas', [simB4.replace(/chocarConElPie\( p, v, azar \);\s*/, ''), armadasB4, CAJAS_DEL_PIE_GLSL] as const, ([si, ar, gl]: readonly [string, string, string]) => choqueBien(si, ar, gl))
controlPositivo('  y uno que apoya a todas (se acumularían)', [simB4, armadasB4, CAJAS_DEL_PIE_GLSL.replace('if ( arriba ) continue;', '')] as const, ([si, ar, gl]: readonly [string, string, string]) => choqueBien(si, ar, gl))

// ═══════════════════════════════════════════════════════════════════════════
titulo('C1 · Teléfono y tablet: el texto de Trabajos se lee sobre el logo de noche')

// La mezcla de s7 no llega al lienzo a través del pin de Trabajos (un sticky: su propio contexto de apilamiento; medido en
// nocturno-final/c1). Abajo de 1024 el texto del cartel y de las demos lleva un halo del color del fondo de su superficie
// (la oscura, en Trabajos): sobre la noche no se ve; sobre el logo, separa las letras de su filo claro.
const banda = leer('_estilos/banda.css')
const enLaBanda = banda.slice(banda.indexOf('@media (width < 1024px) {'), banda.indexOf('/* ── HOVER DONDE HAY'))
const haloBien = (c: string): boolean => /\[data-v3\] \[data-panel='trabajos'\] \[data-pieza='cartel'\],\s*\[data-v3\] \[data-panel='trabajos'\] \[data-capa='demos'\] \{\s*text-shadow: var\(--halo-sobre-la-escena\);/.test(c) && /--halo-sobre-la-escena: 0 0 [0-9.]+em var\(--color-fondo\)/.test(c)
afirmar(haloBien(enLaBanda), 'abajo de 1024 el texto del cartel de Portfolio y el de las demos lleva un halo del fondo de su superficie: se lee sobre el logo de noche (la mezcla no atraviesa el pin)')
controlPositivo('el detector VE el cartel sin halo', enLaBanda.replace('text-shadow: var(--halo-sobre-la-escena);', ''), haloBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('C2 · Tu panel en el teléfono y la tablet: una columna, cada bloque al ancho; las demos se leen')

// Abajo de 1024 cada bloque va a todo el ancho (con los márgenes de la sección) y la demo se dibuja a una pantalla angosta,
// la de su tarjeta: se ve a ~85 % (antes al 35 %: dibujada a ~1000 px en una tarjeta de 300), sin la barra lateral.
const escalaAngosta = (anchoDeLaTarjeta: number): number => anchoDeLaTarjeta / pantallaAngosta(anchoDeLaTarjeta).ancho
const tarjetas = [330, 350, 380, 600, 688, 714]
const angostaBien = (f: typeof pantallaAngosta): boolean => tarjetas.every((w) => { const p = f(w); const e = w / p.ancho; return e >= 0.8 && e <= 0.9 && p.ancho < ANCHO_CON_BARRA && Math.abs(p.alto / p.ancho - DEMO_ANGOSTA.proporcion) < 0.01 })
afirmar(angostaBien(pantallaAngosta), 'abajo de 1024 la demo se dibuja a la pantalla angosta de su tarjeta: se ve a ~85 % (se lee), sin la barra lateral, en 4:5', tarjetas.map((w) => `${String(w)} px → ${escalaAngosta(w).toFixed(2)}`).join(' · '))
controlPositivo('el detector VE la de escritorio en el teléfono (dibujada a 1000 px: al 35 %)', ((w: number) => ({ ancho: Math.max(1000, w), alto: 720 })) as typeof pantallaAngosta, angostaBien)
const demoTsx = sinComentarios(leer('_panel-vivo/DemoDelPanel.tsx'))
const tarjetaTsx = sinComentarios(leer('_secciones/tu-panel/Tarjeta.tsx'))
const columnaBien = (d: string, t: string, clase: (i: number) => string): boolean =>
  d.includes('const enUso = escritorio ? pantalla : pantallaAngosta(el.clientWidth)') && t.includes('max-escritorio:aspect-4/5') && DEMO_ANGOSTA.proporcion === 5 / 4 &&
  [0, 1, 2, 3].every((i) => clase(i).split(' ')[0] === 'w-full' && !/(^| )ml-auto/.test(clase(i)) && /escritorio:@max-6xl:w-(22|18)\/25/.test(clase(i)))
afirmar(columnaBien(demoTsx, tarjetaTsx, claseEnColumna), '  cada bloque a todo el ancho abajo de 1024 (sin la columna escalonada), con el marco de la pantalla angosta; en escritorio, como estaba')
controlPositivo('  el detector VE la columna escalonada de antes', [demoTsx, tarjetaTsx, ((i: number) => (i % 2 === 0 ? 'w-22/25 escritorio:@max-6xl:w-22/25' : 'ml-auto w-18/25 escritorio:@max-6xl:w-18/25')) as typeof claseEnColumna] as const, ([d, t, c]: readonly [string, string, typeof claseEnColumna]) => columnaBien(d, t, c))

// ═══════════════════════════════════════════════════════════════════════════
titulo('C3 · Después de «Y más…»: en el teléfono y la tablet, Tu panel mide su contenido (sin el blanco)')

// Los 700svh son del caos de escritorio; en la columna angosta el contenido mide ~5,8 pantallas a 390 × 844 y lo que sobraba
// (1015 px) era el blanco después del newsletter. Como Servicios y Por qué develOP: abajo de 1024, su contenido. La escena de
// ahí (el amanecer, la noche) se ata a las cajas MEDIDAS, así que no se corre: está medido igual con el alto viejo y el nuevo.
const panelTsx = sinComentarios(leer('_componentes/Panel.tsx'))
type FilaDeAlto = { readonly alto: string; readonly altoAngosto?: 'contenido' }
const sinBlanco = (fila: FilaDeAlto, panel: string): boolean => fila.altoAngosto === 'contenido' && fila.alto === '700svh' && panel.includes("seccion.altoAngosto === 'contenido' ? 'max-escritorio:min-h-0!' : undefined")
afirmar(sinBlanco(seccionDe('tu-panel'), panelTsx), 'abajo de 1024 Tu panel mide su contenido (el piso del alto se apaga); en escritorio sigue en 700svh', `${seccionDe('tu-panel').alto} · ${String(seccionDe('tu-panel').altoAngosto)}`)
controlPositivo('el detector VE la fila de antes (700svh también en el teléfono)', { alto: '700svh' } as FilaDeAlto, (f) => sinBlanco(f, panelTsx))

// ═══════════════════════════════════════════════════════════════════════════
titulo('C4 · El pie angosto: entra en una pantalla y el formulario es una tarjeta sólida')

// Medido (c4/): a 390 × 844 el pie medía 967 px (el titular se cortaba arriba) y sus campos, sin fondo y adentro de la
// mezcla `difference`, desaparecían sobre el logo negro (también a 768). Ahora entra en 375 × 635, 390 × 664 (un iPhone con
// las barras de Safari) y 768 × 1024. Acá, lo que lo hace: la tarjeta sin mezcla, la grilla del formulario, el relleno.
const pieAngosto = marcar(<Cierre seccion={seccionDe('cierre')} />, { anima: false })
const clasesDe = (html: string): string[] => [...html.matchAll(/class="([^"]*)"/g)].map((m) => m[1])
const tarjetaBien = (html: string): boolean => {
  const tarjeta = clasesDe(html).filter((c) => /max-escritorio:bg-fondo/.test(c) && /max-escritorio:border\b/.test(c) && /max-escritorio:shadow-flotante/.test(c))
  const iForm = html.indexOf('<form id="contacto"')
  const iTarjeta = tarjeta.length === 1 ? html.indexOf(`class="${tarjeta[0]}"`) : -1
  // Entre la tarjeta y el formulario: sólo el rótulo «Contacto»; nada que mezcle adentro de la tarjeta.
  const adentro = iTarjeta >= 0 && iForm > iTarjeta ? html.slice(iTarjeta, html.indexOf('</form>', iForm)) : ''
  return tarjeta.length === 1 && !tarjeta[0].includes('mix-blend-difference') && adentro.length > 0 && !adentro.includes('mix-blend-difference') && clasesDe(html).filter((c) => c.includes('mix-blend-difference')).length === 3
}
afirmar(tarjetaBien(pieAngosto), 'abajo de 1024 el contacto es UNA tarjeta sólida (el papel, borde y sombra) sin nada que mezcle adentro; mezclan sólo la identidad, el recorrido y la fila de abajo')
controlPositivo('el detector VE la tarjeta mezclando (los campos de antes)', pieAngosto.replace('max-escritorio:shadow-flotante', 'max-escritorio:shadow-flotante max-escritorio:mix-blend-difference'), tarjetaBien)
const formularioTsx = sinComentarios(leer('_secciones/cierre/FormularioDelPie.tsx'))
const grillaBien = (f: string): boolean =>
  f.includes("'grid grid-cols-6 gap-[var(--spacing-3)] escritorio:flex escritorio:flex-col escritorio:gap-[var(--spacing-5)]'") &&
  f.includes("{ nombre: 'col-span-3', mail: 'col-span-3', mensaje: 'col-span-4' }") &&
  f.includes('className="self-start max-escritorio:col-span-2 max-escritorio:self-end escritorio:mt-[var(--spacing-2)]"') &&
  /max-escritorio:bg-tinta max-escritorio:px-\[var\(--spacing-3\)\] max-escritorio:text-fondo/.test(f) &&
  /text-cuerpo max-escritorio:text-base leading-texto/.test(f)
afirmar(grillaBien(formularioTsx), '  el formulario angosto: el nombre y el mail lado a lado, el mensaje y Enviar (lleno, de tinta) abajo; los campos a 16 px (Safari no agranda al tocar); en escritorio, una columna como antes')
controlPositivo('  el detector VE los campos a 15 px en el teléfono', formularioTsx.replace('text-cuerpo max-escritorio:text-base leading-texto', 'text-cuerpo leading-texto'), grillaBien)
const bandaC4 = leer('_estilos/banda.css')
const enLaBandaC4 = bandaC4.slice(bandaC4.indexOf('@media (width < 1024px) {'), bandaC4.indexOf('/* ── HOVER DONDE HAY'))
const rellenoBien = (c: string): boolean => /\[data-v3\] \[data-panel='cierre'\] \[data-pieza='pie'\] \{\s*padding-block: calc\(var\(--spacing-12\) \+ var\(--spacing-6\)\) var\(--spacing-12\);/.test(c)
afirmar(rellenoBien(enLaBandaC4), '  el relleno del pie angosto: 72 px arriba (el botón del menú termina a 64) y 48 abajo (la esquina del recorrido queda a la derecha)')
controlPositivo('  el detector VE el relleno de escritorio (80 y 80)', enLaBandaC4.replace("[data-v3] [data-panel='cierre'] [data-pieza='pie'] {", '[data-v3] [data-x] {'), rellenoBien)
type Rotulos = { readonly rotulo: string; readonly corto: string }
const corto = (w: Rotulos, html: string): boolean => w.rotulo.includes(w.corto) && w.corto.length < w.rotulo.length && html.includes(`<span class="max-tablet:hidden">`) && html.includes(`<span class="tablet:hidden">`)
afirmar(corto(WHATSAPP, pieAngosto) && /max-tablet:text-fluido-titulo-l/.test(sinComentarios(leer('_secciones/cierre/Cierre.tsx'))), '  en el teléfono el titular va un nivel abajo (dos renglones) y WhatsApp con su rótulo corto (el nombre del enlace lo contiene): el mail y WhatsApp en una fila', `«${WHATSAPP.corto}»`)
controlPositivo('  el detector VE un rótulo corto que no está en el largo', { rotulo: WHATSAPP.rotulo, corto: 'WA' } as Rotulos, (w) => corto(w, pieAngosto))

// ═══════════════════════════════════════════════════════════════════════════
titulo('C5 · El menú del teléfono: tres barras, Contacto como un ítem más, sin Login; la franja que cierra (sin cruz)')

const menuMovilC5 = sinComentarios(leer('_chrome/menu/MenuMovil.tsx'))
const panelC5 = sinComentarios(leer('_chrome/menu/PanelDelMenu.tsx'))
const vidrioDelMenuC5 = sinComentarios(leer('_chrome/menu/MenuDeVidrio.tsx'))
const franjaC5 = sinComentarios(leer('_chrome/menu/franja.ts'))
const hojaDelVidrio = leer('_estilos/vidrio.css')
const botonBien = (m: string, p: string): boolean =>
  m.includes('{TRES_BARRAS}') && !/Isotipo/.test(m) && m.includes("data-seccion={invertido ? 'invertida' : undefined}") && /import \{ Menu as TresBarras \} from 'lucide-react'/.test(p) && /<TresBarras aria-hidden="true" strokeWidth=\{1\.5\}/.test(p)
afirmar(botonBien(menuMovilC5, panelC5), 'el botón del menú son las tres barras (era el logo), con el mismo tono por zona que tenía: el del botón (`data-seccion`)')
controlPositivo('el detector VE el logo de antes', [menuMovilC5.replace('{TRES_BARRAS}', '<Isotipo />'), panelC5] as const, ([m, p]) => botonBien(m, p))
const sinLoginNiCruz = (p: string): boolean => !/ENLACE_DE_LOGIN|pie-del-menu|lucide-react'.*\bX\b|\{CRUZ\}/.test(p) && /\{ENLACE_DE_CONTACTO\.rotulo\}\s*<\/button>\s*<\/li>\s*<\/ul>\s*<\/nav>/.test(p)
afirmar(sinLoginNiCruz(panelC5), '  adentro: las secciones y Contacto como la última (abre el panel de contacto); sin Login ni el pie del menú, y sin cruz')
controlPositivo('  el detector VE el Login de antes', panelC5 + '\n<a href={ENLACE_DE_LOGIN.destino}>', sinLoginNiCruz)
// La franja: el círculo del botón (recorte de 48 px redondo, en el centro) que con el panel abierto llega a todo el ancho.
const franjaCss = (c: string): boolean =>
  c.includes('clip-path: inset(0 calc(50% - var(--spacing-6)) round var(--spacing-6));') &&
  /\[data-franja="abierta"\] \[data-parte="franja"\] \{\s*clip-path: inset\(0 0 round var\(--vidrio-radio\) var\(--vidrio-radio\) 0 0\);/.test(c) &&
  /transition-property: clip-path, background-color;\s*transition-duration: var\(--duracion-rapida\);/.test(c) &&
  /\[data-parte="cerrar-el-menu"\] > \* \{\s*position: relative;\s*grid-area: 1 \/ 1;/.test(c) &&
  /@keyframes brillo-de-la-franja \{\s*0% \{\s*background-position: 100% 0;\s*\}\s*55%,\s*100% \{\s*background-position: 0 0;/.test(c) &&
  /@media \(prefers-reduced-motion: reduce\) \{\s*\[data-v3\] \[data-pieza="vidrio"\] \[data-parte="cerrar-el-menu"\] \* \{\s*transition: none !important;\s*animation: none !important;/.test(c)
afirmar(franjaCss(hojaDelVidrio), '  la franja: el círculo del botón se estira a todo el ancho de arriba del vidrio (y vuelve), con «Click para cerrar» en gris y un brillo de izquierda a derecha; las capas, apiladas en el orden del árbol (el recorte, si no, se pintaba encima del rótulo); con movimiento reducido, quieta')
controlPositivo('  el detector VE las capas sin posicionar (el rótulo lavado)', hojaDelVidrio.replace('position: relative;\n  grid-area: 1 / 1;', 'grid-area: 1 / 1;'), franjaCss)
// El cierre: primero la franja se recoge en el círculo (lo que tarda sale de su transición) y recién después el Genie, con
// el botón que reaparece cuando arranca; al abrir, se estira cuando el panel terminó de abrir.
const pokebola = (v: string, f: string): boolean => {
  const i = [v.indexOf('const recogida = estabaAbierto ? msDeLaFranja(caja.current) : 0'), v.indexOf('estirarLaFranja(caja.current, false)\n    if (recogida === 0)'), v.indexOf('const reloj = window.setTimeout(genie, recogida)')]
  const g = v.indexOf('const genie = (): void => {\n      alCubrir(false)')
  return i.every((x) => x > 0) && i[0] < i[1] && i[1] < i[2] && g > 0 && g < i[0] && /if \(!reducido\) requestAnimationFrame\(\(\) => estirarLaFranja\(caja\.current, true\)\)/.test(v) && /transitionDuration/.test(f) && !/\b300\b/.test(f)
}
afirmar(pokebola(vidrioDelMenuC5, franjaC5), '  al tocarla, la franja vuelve al círculo y recién ahí el panel se va en él (como una pokébola que se cierra); al abrir, el círculo se estira cuando el panel terminó de salir')
controlPositivo('  el detector VE el Genie que arranca sin esperar a la franja', [vidrioDelMenuC5.replace('const reloj = window.setTimeout(genie, recogida)', 'genie()\n    const reloj = 0'), franjaC5] as const, ([v, f]) => pokebola(v, f))

cerrar('s52-nocturno-final')
