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
 * Lo que se mira en vivo: `~/.cache/b4-medicion/nocturno-final/mirar.txt`.
 */
import { readFileSync } from 'node:fs'

import * as THREE from 'three'

import { CURVA_DEL_VIAJE, DURACION_DEL_VIAJE_MS, VIAJE_CON_TOPE, duracionDelViaje } from '../../_componentes/deslizamiento'
import { viajarSinLenis } from '../../_componentes/viajeSinLenis'
import { aimWithFraming } from '../escena/cameraFraming'
import { elevacionDe } from '../escena/lightArc'
import { FINAL_DEL_PIE, RELOJ_DEL_FINAL, camaraDelFinal, decidirElGesto, haciaCero, pasoDelReloj, relojDelQuieto, relojQuieto, subida, type EntradaDelReloj, type RelojDelFinal } from '../escena/final/recorridoDelFinal'
import { bloqueTapaElCuadro } from '../escena/nocheDisparada'
import { ORBIT_TARGET_Y } from '../escena/probeScene'
import { TOPE_DEL_CUADRO_DEL_VIAJE_MS } from '../escena/viaje'
import { SEPARA_LOS_GESTOS_MS, empiezaUnGesto } from '../gestosDelScroll'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

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
const alturaDelViaje = (c: string): boolean => /arc\.level = nivelConLaInterfaz\(arc\.level, Math\.min\(delta, 0\.1\)\)\s*if \(viajeEnCurso\(\) !== null\) arc\.elevationDeg = elevacionDe\(arc\.level\)/.test(c)
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

cerrar('s52-nocturno-final')
